---
type: Source Map
title: Source Map
description: File-by-file inventory of the RESTHeart Cloud React starter, mapping every source file to its purpose and cross-referencing documentation.
tags: [source-map, reference, files]
verified:
  - by: openwiki/0.6.0
    at: 2026-09-25T09:42:01.514Z
sources:
  - id: openwiki-source-85dc2a049a0943b56218c045
    resource: repo://public/privacy.html
  - id: openwiki-source-ad504d4d06a9b4cc6851d32b
    resource: repo://public/terms.html
  - id: openwiki-source-cec027055a927c253ba22cff
    resource: repo://rhc.setup.consents.ts
  - id: openwiki-source-61cc9cbff8e3e2bb34c724a6
    resource: repo://rhc.setup.ts
  - id: openwiki-source-54631e6ebf1d3b815c4a5eed
    resource: repo://src/App.tsx
  - id: openwiki-source-a3fd7ec517783a7d5d8842d0
    resource: repo://src/consents-signal.ts
  - id: openwiki-source-41263ba637a35415c845f5fb
    resource: repo://src/ConsentsGate.css
  - id: openwiki-source-9674080b0675d512256b80bc
    resource: repo://src/ConsentsGate.tsx
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-95bfccfd0c712f6e72040e0d
    resource: repo://src/main.tsx
generated: { by: "openwiki/0.6.0", at: "2026-09-25T09:42:01.514Z" }
---

# Source Map

Complete inventory of repository source files. Each entry links to the page where that area is explained in depth.

## Root Config & Build

| File | Purpose | See Also |
|------|---------|----------|
| `package.json` | Project metadata, dependencies (`@restheart-cloud/kit-react`, `react`, `react-router-dom`), scripts (`dev`, `build`, `preview`, `test`) | [Operations](operations/runbook.md) |
| `package-lock.json` | Lockfile — do not edit manually | — |
| `tsconfig.json` | TypeScript config: ES2020 target, ESNext modules, strict mode, JSX React, `noEmit` (Vite compiles) | — |
| `vite.config.ts` | Vite config: minimal — just the `@vitejs/plugin-react` plugin | [Testing](testing/guidance.md) |
| `index.html` | SPA shell: mounts `#root` div, links `/src/main.tsx` as entry module | — |
| `.gitignore` | Ignores `node_modules`, `dist`, `.env*`, IDE files | — |

## Entrypoint & App Shell

| File | Purpose | See Also |
|------|---------|----------|
| `src/main.tsx` | React root creation. Renders `<StrictMode>` → `<BrowserRouter>` → `<RhAuthProvider>` → `<App />`. Imports `styles.css` and passes `consentsOnError` as `config.onError` to the auth provider. | [Architecture](architecture/overview.md) |
| `src/App.tsx` | Fragment token capture on mount, API URL validation gate, renders `ConfigPage` or route tree wrapped in `<ConsentsGate>` via `useRoutes()` | [Architecture](architecture/overview.md) |
| `src/ConfigPage.tsx` | Setup wizard shown when `apiUrl` is invalid. Guides user to create a service at `cloud.restheart.com` and edit `environment.ts`. | [Operations](operations/runbook.md) |
| `src/routes.tsx` | Route definitions as `RouteObject[]`. Lazy-loaded components, feature-flag conditional inclusion, `AuthGuard`/`PublicGuard` wrappers. | [Architecture](architecture/overview.md) |

## Environment & Utilities

| File | Purpose | See Also |
|------|---------|----------|
| `src/environments/environment.ts` | **Central config**: `apiUrl` (RESTHeart Cloud service URL) + `features` object (feature flags) | [Auth & Teams](domain/auth-and-teams.md#feature-flags), [Operations](operations/runbook.md) |
| `src/just-signed-up.ts` | Module-level boolean flag. Set to `true` when `?flow=signup` query param is detected in fragment token capture. Shell reads and clears it to show a welcome message. | [Auth & Teams](domain/auth-and-teams.md) |
| `src/oauth-url.ts` | Builds OAuth authorize URL: `${apiUrl}/auth/oauth/authorize/${provider}?noauthchallenge` | [Auth & Teams](domain/auth-and-teams.md#oauth-login) |

## Styling

| File | Purpose | See Also |
|------|---------|----------|
| `src/styles.css` | **Design tokens** (section 1), reset/base styles (section 2), skin classes (section 3), utility classes (section 4), page scaffolds (section 5). Explicitly a disposable mockup — meant to be replaced. | [Operations](operations/runbook.md#design-system) |
| `src/vite-env.d.ts` | Vite client type reference | — |

## UI Components

| File | Purpose | See Also |
|------|---------|----------|
| `src/ui/alert/Alert.tsx` | Shared feedback component. Props: `type` ("error"/"success"), `children`, `onClose`, `dismissible?` (default `true`), `autoDismiss?` (default `4000`ms). Auto-dismisses after the timeout. Uses `.form-error` / `.success-msg` class hooks and correct ARIA roles (`alert` / `status`). | [Auth & Teams](domain/auth-and-teams.md) |

## Consents Gate

The consents gate is a full-stack feature that requires users to accept the current Terms of Service and Privacy Policy before using the app. It comprises client-side components that display an acceptance overlay, a signal module that tracks the blocked state, and server-side setup scripts that configure the Guards rule, permissions, and schema. See [RHC Setup Workflow](workflows/rhc-setup.md) for the complete setup procedure.

| File | Purpose | See Also |
|------|---------|----------|
| `src/consents-signal.ts` | Client-side signal module. Maintains a `blocked` boolean and a listener set. Exports `isBlocked()`, `setBlocked()`, and `subscribe()` for state management. Also exports `consentsOnError` callback (for `RhAuthProvider`) that raises the flag on any `451` response from the service. | [Architecture](architecture/overview.md) |
| `src/ConsentsGate.tsx` | Overlay component rendered above the router in `App.tsx`. When blocked, replaces the entire app with an acceptance form containing two checkboxes (ToS and Privacy Policy links) and an "I accept" button. Calls `auth.acceptConsents()` to record acceptance and `auth.checkSession()` to refresh the session. Also provides a "Sign out" option that clears the blocked flag. | [Architecture](architecture/overview.md) |
| `src/ConsentsGate.css` | Styles for the consents overlay. Fixed positioning with `z-index: 400` (above header, dropdown, and navigation progress bar). Modal dialog with no close button or backdrop click — only acceptance or sign-out exits. | — |
| `public/terms.html` | **Placeholder** Terms of Service document. Plain HTML served from the `public/` directory with no build step. Includes theme syncing (reads `rh-theme` from `localStorage`) and a version string (`2026-07-01`) that must match the version in the Guards rule and ACL permission. | [RHC Setup](workflows/rhc-setup.md) |
| `public/privacy.html` | **Placeholder** Privacy Policy document. Plain HTML served from the `public/` directory with no build step. Includes theme syncing and a version string (`2026-07-01`) that must match the version in the Guards rule and ACL permission. | [RHC Setup](workflows/rhc-setup.md) |

## Service Setup

These files configure the RESTHeart Cloud service to match the starter's requirements. They are run with the `@restheart-cloud/cli` tool (`rhc setup`). The consents setup imports and extends the base accounts setup, adding the Guards rule, permissions, schema, and claims required for the consents gate.

| File | Purpose | See Also |
|------|---------|----------|
| `rhc.setup.ts` | **Base accounts setup**. Configures the RESTHeart Cloud service for the starter's authentication needs: installs the accounts feature, sets `app-name` and `frontend-url`, enables/disables features (registration, verification, password-reset, invitations, OAuth) based on `environment.features`, configures Google OAuth credentials (when enabled), and adds the app origin to the CORS allowlist. Feature flags are derived from the app's `environment.ts` to prevent drift. | [RHC Setup](workflows/rhc-setup.md) |
| `rhc.setup.consents.ts` | **Consents gate setup**. Imports and extends `rhc.setup.ts` with four additional documents: a JSON Schema for user documents (including `latestConsents` and `consents` history fields), an ACL permission that allows users to PATCH their own consents (with server-side version stamping via `mergeRequest`), JWT claims configuration (`latestConsents/tos` and `latestConsents/pp`), and a Guards rule that blocks authenticated users who have not accepted the current versions (HTTP 451). Versions are defined once as `TOS_VERSION` and `PP_VERSION` constants. | [RHC Setup](workflows/rhc-setup.md) |

## Page Components

### Shell (Authenticated Frame)

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/shell/Shell.tsx` | Authenticated layout: header with team name, nav links, user avatar dropdown menu (profile, account, theme toggle, logout), `<Outlet>` for child routes. Contains `useTheme()` hook for light/dark mode persisted to `localStorage`. | [Operations](operations/runbook.md#theming) |
| `src/pages/shell/Shell.css` | Shell-specific layout styles | — |

### Home

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/home/Home.tsx` | **Getting-started page**. Welcome hero, feature-flag status grid (on/off badges linked to team/account pages), 5-step customization guide, and an interactive `auth.api('/demo')` fetch demo. Replace with your own landing content. | [Auth & Teams](domain/auth-and-teams.md#reading-your-own-data) |
| `src/pages/home/Home.css` | Home page styles | — |

### Auth Pages

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/auth/login/Login.tsx` | Email/password login form. Shows OAuth buttons if `oauthLogin` is enabled. Form validation (email format, required fields), error display, loading state. Reads `error` search param for `invalid_token` message. Links to signup and forgot-password. | [Auth & Teams](domain/auth-and-teams.md#login) |
| `src/pages/auth/signup/Signup.tsx` | Registration form with first name, last name, email, password. Auto-generates team name. On success shows "Check your email" confirmation. OAuth buttons shown when enabled. Handles 409 duplicate email. | [Auth & Teams](domain/auth-and-teams.md#signup) |
| `src/pages/auth/verify/Verify.tsx` | Email verification page. Reads `email`, `token`, and `error` from URL search params. Handles missing params and error states. Calls `auth.verify(email, token)` which returns a redirect URL. | [Auth & Teams](domain/auth-and-teams.md#email-verification) |
| `src/pages/auth/forgot-password/ForgotPassword.tsx` | Request password reset email. | [Auth & Teams](domain/auth-and-teams.md#password-reset) |
| `src/pages/auth/reset-password/ResetPassword.tsx` | Set new password using reset token from email link. | [Auth & Teams](domain/auth-and-teams.md#password-reset) |
| `src/pages/auth/oauth-buttons/OAuthButtons.tsx` | Renders OAuth provider buttons (Google, etc.). Builds URLs via `oauthUrl()`. | [Auth & Teams](domain/auth-and-teams.md#oauth-login) |
| `src/pages/auth/oauth-buttons/OAuthButtons.css` | OAuth button styles | — |

### Invitations

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/invitations/accept/Accept.tsx` | **One page, three flows**: (1) missing params → error, (2) new user → set password form (`auth.activate()`), (3) existing user → login + accept (`auth.acceptInvite()`). No route guard — works signed-in or out. | [Auth & Teams](domain/auth-and-teams.md#invitations) |

### Teams

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/teams/Teams.tsx` | Team list. Shows all user's teams with role, active badge, switch button. Links to team detail and new team. | [Auth & Teams](domain/auth-and-teams.md#team-management) |
| `src/pages/teams/detail/TeamDetail.tsx` | Full team management: member list with role change/remove (owner), invite form, pending invitations with resend cooldown (5 min), team name/description settings, and delete team with confirmation dialog. | [Auth & Teams](domain/auth-and-teams.md#team-detail-teamsid) |
| `src/pages/teams/new/NewTeam.tsx` | Create new team form. | [Auth & Teams](domain/auth-and-teams.md#team-management) |
| `src/pages/teams/*.css` | Team-specific layout styles | — |

### Account

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/account/Account.tsx` | User profile management (first name, last name via `auth.updateProfile()`) + change password form (`auth.changePassword()`). Loads profile via `auth.checkSession()` on mount. | [Auth & Teams](domain/auth-and-teams.md#reading-your-own-data) |
| `src/pages/account/Account.css` | Account page styles | — |

## CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/openwiki-update.yml` | GitHub Actions workflow: runs OpenWiki documentation update daily at 04:00 UTC, creates PR with changes |
| `AGENTS.md` / `CLAUDE.md` | Agent instruction files for OpenWiki documentation runs |
