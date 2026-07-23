---
type: Architecture
title: Architecture Overview
description: Runtime architecture of the RESTHeart Cloud React starter — component tree, authentication provider setup, routing strategy, fragment token capture, and config gating.
tags: [architecture, react, auth, routing, restheart-cloud]
---

# Architecture Overview

This page explains how the application boots, authenticates users, routes requests, and gates unconfigured deployments.

## Component Tree

```
<StrictMode>
  <BrowserRouter>
    <RhAuthProvider config={{ apiBaseUrl }}>
      <App />                     ← fragment token capture + config gate
        ├── <ConfigPage />        ← if apiUrl is invalid
        └── useRoutes(routes)     ← React Router route tree
              ├── PublicGuard → Login / Signup / Verify / ForgotPassword / ResetPassword
              ├── Accept (no guard — works signed-in or out)
              └── AuthGuard → Shell (authenticated frame)
                    └── <Outlet /> → Home / Teams / NewTeam / TeamDetail / Account
```

The entrypoint is `src/main.tsx`, which renders `<RhAuthProvider>` from `@restheart-cloud/kit-react` wrapping the entire app. This provider manages auth state (user, teams, tokens) and exposes it via the [`useAuth()` hook](domain/auth-and-teams.md).

## Auth Provider

`RhAuthProvider` receives `config={{ apiBaseUrl: environment.apiUrl }}` and provides:

- **`auth.user`** — the authenticated user object (with `profile.name`, `profile.surname`, `_id`)
- **`auth.teams`** — array of `TeamMembership` objects (each with `id.$oid`, `name`, `role`, `active`)
- **`auth.login(email, password)`** — email/password login
- **`auth.logout()`** — sign out
- **`auth.loadTeams()`** — fetch team memberships
- **`auth.switchTeam(teamId)`** — switch active team
- **`auth.activate({ email, token, password })`** — activate new user from invitation
- **`auth.acceptInvite(token)`** — accept invitation for existing user
- **`auth.getInvitation(email, token)`** — fetch invitation details

Token management (`setToken`, `scheduleRefresh`) is also provided by the kit and is called during [fragment token capture](#fragment-token-capture).

## Routing Strategy

Routes are defined in `src/routes.tsx` using React Router v6's `RouteObject[]` array with `useRoutes()`. Key design decisions:

### Lazy Loading

Every page component is imported with `lazy()` and wrapped in a `<Suspense fallback={null}>`. This produces one chunk per page:

```typescript
const Login = lazy(() => import('./pages/auth/login/Login'));
const Shell = lazy(() => import('./pages/shell/Shell'));
// ... etc
```

### Feature-Flag Gating

Routes are conditionally included in the array based on [feature flags](domain/auth-and-teams.md#feature-flags) from `src/environments/environment.ts`:

```typescript
const { emailRegistration, passwordReset, oauthLogin, teamInvitations } = environment.features;

// Signup route only if email registration or OAuth is enabled
...(emailRegistration || oauthLogin ? [{ path: 'auth/signup', ... }] : []),
// Password reset routes only if passwordReset is enabled
...(passwordReset ? [{ path: 'auth/forgot-password', ... }, { path: 'auth/reset-password', ... }] : []),
// Invitation route only if teamInvitations is enabled
...(teamInvitations ? [{ path: 'invitations/accept', ... }] : []),
```

A flag that is `false` removes both the route and the corresponding UI (links, buttons) from the app.

### Route Guards

| Guard | Behavior |
|-------|----------|
| `PublicGuard` | Renders children only when the user is **not** authenticated; redirects to `/` if already logged in |
| `AuthGuard` | Renders children only when the user **is** authenticated; redirects to `/auth/login` if not |

`Accept` (invitation page) has **no guard** — it works whether the user is signed in or out, which is required because invitation links are opened from email.

### Catch-All

`{ path: '*', element: <Home /> }` redirects any unknown path to the home page (which itself is behind `AuthGuard`).

## Fragment Token Capture

After an OAuth redirect, the auth provider returns the access token in the URL **fragment** (`#access_token=...`). `App.tsx` calls `consumeFragmentToken()` on mount:

1. Reads `window.location.hash`
2. Extracts `access_token` from the fragment parameters
3. Calls `setToken(accessToken)` and `scheduleRefresh({ apiBaseUrl })`
4. Also checks for `?flow=signup` query param and sets the `justSignedUp` flag
5. Cleans the URL with `history.replaceState` to remove the hash and query params

This runs once on app load, before any route renders.

## Config Gating

`App.tsx` validates `environment.apiUrl` with `isValidApiBaseUrl()` from the kit. If the URL is not a valid `*.restheart.com` address:

- A `<ConfigPage>` is rendered instead of the route tree
- An error is logged to the console
- The app is effectively locked until `apiUrl` is fixed

This prevents confusing failures when someone clones the repo but forgets to configure the service URL.

## See Also

- [Auth & Teams](domain/auth-and-teams.md) — detailed auth flows, team management, and feature flag definitions
- [Operations & Runbook](operations/runbook.md) — how to configure `environment.ts` and the styling system
- [Source Map](source-map.md) — file-by-file inventory
