---
type: Architecture
title: Architecture Overview
description: Runtime architecture of the RESTHeart Cloud React starter — component tree, authentication provider setup, routing strategy, fragment token capture, config gating, and consents gate.
tags: [architecture, react, auth, routing, restheart-cloud, consents]
verified:
  - by: openwiki/0.6.0
    at: 2026-09-25T09:42:01.514Z
sources:
  - id: openwiki-source-54631e6ebf1d3b815c4a5eed
    resource: repo://src/App.tsx
  - id: openwiki-source-a3fd7ec517783a7d5d8842d0
    resource: repo://src/consents-signal.ts
  - id: openwiki-source-9674080b0675d512256b80bc
    resource: repo://src/ConsentsGate.tsx
  - id: openwiki-source-95bfccfd0c712f6e72040e0d
    resource: repo://src/main.tsx
generated: { by: "openwiki/0.6.0", at: "2026-09-25T09:42:01.514Z" }
---

# Architecture Overview

This page explains how the application boots, authenticates users, routes requests, gates unconfigured deployments, and enforces Terms of Service / Privacy Policy acceptance.

## Component Tree

```
<StrictMode>
  <BrowserRouter>
    <RhAuthProvider config={{ apiBaseUrl, onError: consentsOnError }}>
      <App />                     ← fragment token capture + config gate
        ├── <ConfigPage />        ← if apiUrl is invalid
        └── <ConsentsGate>        ← wraps route element
              └── useRoutes(routes)   ← React Router route tree
                    ├── PublicGuard → Login / Signup / Verify / ForgotPassword / ResetPassword
                    ├── Accept (no guard — works signed-in or out)
                    └── AuthGuard → Shell (authenticated frame)
                          └── <Outlet /> → Home / Teams / NewTeam / TeamDetail / Account
```

The entrypoint is `src/main.tsx`, which renders `<RhAuthProvider>` from `@restheart-cloud/kit-react` wrapping the entire app. This provider manages auth state (user, teams, tokens) and exposes it via the [`useAuth()` hook](../domain/auth-and-teams.md).

## Auth Provider

`RhAuthProvider` receives `config={{ apiBaseUrl: environment.apiUrl, onError: consentsOnError }}` and provides:

### Properties

- **`auth.user`** — the authenticated user object (with `profile.name`, `profile.surname`, `_id`)
- **`auth.teams`** — array of `TeamMembership` objects (each with `id.$oid`, `name`, `role`, `active`)
- **`auth.isAuthenticated`** — boolean indicating whether the user is currently signed in

### Authentication

- **`auth.login(email, password)`** — email/password login
- **`auth.logout()`** — sign out
- **`auth.register({ teamName, firstName, lastName, email, password })`** — create account and default team
- **`auth.checkSession()`** — validate current session, returns user or null
- **`auth.forgotPassword(email)`** — request password reset email
- **`auth.resetPassword({ email, token, password })`** — set new password with reset token
- **`auth.verify(email, token)`** — verify email address, returns redirect URL

### Invitations

- **`auth.activate({ email, token, password })`** — activate new user from invitation
- **`auth.acceptInvite(token)`** — accept invitation for existing user
- **`auth.getInvitation(email, token)`** — fetch invitation details

### Team Management

- **`auth.loadTeams()`** — fetch team memberships, returns the updated array
- **`auth.switchTeam(teamId)`** — switch active team
- **`auth.createTeam(name)`** — create a new team
- **`auth.updateTeam({ name, description })`** — update team settings
- **`auth.deleteTeam()`** — delete the active team (owner only, no members remaining)
- **`auth.listTeamMembers()`** — list members of the active team
- **`auth.listInvitations()`** — list pending invitations for the active team
- **`auth.invite(email, role)`** — send team invitation
- **`auth.resendInvite(email)`** — resend a pending invitation
- **`auth.removeMember(email)`** — remove a member from the active team
- **`auth.updateMemberRole(email, role)`** — change a member's role

### User Profile

- **`auth.updateProfile({ firstName, lastName })`** — update user profile
- **`auth.changePassword(currentPassword, newPassword)`** — change password

### Data Access

- **`auth.api(path)`** — authenticated `fetch` wrapper; attaches the bearer token automatically and rejects non-2xx responses as `ApiError({ status, message })`. Use this for your app's own collections — see [Auth & Teams](../domain/auth-and-teams.md#reading-your-own-data).

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

Routes are conditionally included in the array based on [feature flags](../domain/auth-and-teams.md#feature-flags) from `src/environments/environment.ts`:

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

## Consents Gate

The `ConsentsGate` component sits **above the router** in `App.tsx`, not inside the Shell. This placement is critical: a user who has not accepted the current Terms of Service and Privacy Policy has no session — the service answers `451` to every request, including `/users/me`. If the gate were inside the Shell (behind `AuthGuard`), the session check would fail and `AuthGuard` would bounce the user to the login page, creating an infinite loop.

### How it works

1. The service's Guards rule blocks every request from a user who has not accepted the current consents, returning HTTP `451 Unavailable For Legal Reasons`.
2. `RhAuthProvider` passes `consentsOnError` (from `src/consents-signal.ts`) as `config.onError`.
3. When session restoration (the first thing the app does on load) receives a `451`, `consentsOnError` sets the `blocked` flag in the signal.
4. `ConsentsGate` subscribes to that signal and, when blocked, replaces the entire app with an acceptance overlay.
5. The overlay lets the user accept the Terms of Service and Privacy Policy, then calls `auth.acceptConsents()` and `auth.checkSession()` to reload the session.
6. If the user declines, they can sign out, which clears the blocked flag for the next user.

The overlay is a UX convenience, not enforcement: removing it with dev tools still results in `451` responses from the server.

### Boot Sequence

The following diagram shows the full boot sequence, including session restoration, consents gating, and config validation.

```mermaid
sequenceDiagram
    participant main as main.tsx
    participant RhAuth as RhAuthProvider
    participant signal as consents-signal
    participant App as App
    participant Gate as ConsentsGate
    participant Routes as useRoutes

    main->>RhAuth: render with onError=consentsOnError
    RhAuth->>RhAuth: restore session (GET /users/me)
    alt 451 response
        RhAuth->>signal: consentsOnError(err)
        signal->>Gate: setBlocked(true)
    end
    RhAuth-->>App: render
    App->>App: consumeFragmentToken()
    App->>App: validate apiConfigured
    alt !apiConfigured
        App-->>App: render ConfigPage
    else apiConfigured
        App->>Gate: wrap route element
        Gate->>Gate: check blocked state
        alt blocked
            Gate-->>Gate: show acceptance overlay
        else not blocked
            Gate->>Routes: render routes
        end
    end
```

*Boot sequence showing session restoration, consents gate, and config gating.*

## See Also

- [Auth & Teams](../domain/auth-and-teams.md) — detailed auth flows, team management, and feature flag definitions
- [Operations & Runbook](../operations/runbook.md) — how to configure `environment.ts` and the styling system
- [Source Map](../source-map.md) — file-by-file inventory
