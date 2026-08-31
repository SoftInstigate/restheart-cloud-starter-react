---
type: Source Map
title: Source Map
description: File-by-file inventory of the RESTHeart Cloud React starter, mapping every source file to its purpose and cross-referencing documentation.
tags: [source-map, reference, files]
verified:
  - by: openwiki/0.4.3
    at: 2026-08-31T10:59:30.610Z
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
  - id: openwiki-source-9674080b0675d512256b80bc
    resource: repo://src/ConsentsGate.tsx
  - id: openwiki-source-c9161dbd621f22e3073aa0a1
    resource: repo://src/pages/auth/login/Login.tsx
  - id: openwiki-source-218c8734c88d36610ad967a5
    resource: repo://src/pages/auth/oauth-buttons/OAuthButtons.tsx
  - id: openwiki-source-9b67846f4bc6291f7850560e
    resource: repo://src/pages/auth/signup/Signup.tsx
generated: { by: "openwiki/0.4.3", at: "2026-08-31T10:59:30.610Z" }
---

# Source Map

Complete inventory of repository source files. Each entry links to the page where that area is explained in depth.

## Root Config & Build

| File | Purpose | See Also |
|------|---------|----------|
| `package.json` | Project metadata, dependencies (`@restheart-cloud/kit-react`, `react`, `react-router-dom`), scripts (`dev`, `build`, `preview`, `test`) | [Operations](/openwiki/operations/runbook.md) |
| `package-lock.json` | Lockfile — do not edit manually | — |
| `tsconfig.json` | TypeScript config: ES2020 target, ESNext modules, strict mode, JSX React, `noEmit` (Vite compiles) | — |
| `vite.config.ts` | Vite config: minimal — just the `@vitejs/plugin-react` plugin | [Testing](/openwiki/testing/guidance.md) |
| `index.html` | SPA shell: mounts `#root` div, links `/src/main.tsx` as entry module | — |
| `.gitignore` | Ignores `node_modules`, `dist`, `.env*`, IDE files | — |

## Entrypoint & App Shell

| File | Purpose | See Also |
|------|---------|----------|
| `src/main.tsx` | React root creation. Renders `<StrictMode>` → `<BrowserRouter>` → `<RhAuthProvider>` → `<App />`. Imports `styles.css`. | [Architecture](/openwiki/architecture/overview.md) |
| `src/App.tsx` | Fragment token capture on mount, API URL validation gate, renders `ConfigPage` or route tree via `useRoutes()`. Wraps router in `<ConsentsGate>` above `AuthGuard`. | [Architecture](/openwiki/architecture/overview.md) |
| `src/ConfigPage.tsx` | Setup wizard shown when `apiUrl` is invalid. Guides user to create a service at `cloud.restheart.com` and edit `environment.ts`. | [Operations](/openwiki/operations/runbook.md) |
| `src/routes.tsx` | Route definitions as `RouteObject[]`. Lazy-loaded components, feature-flag conditional inclusion, `AuthGuard`/`PublicGuard` wrappers. | [Architecture](/openwiki/architecture/overview.md) |

## Environment & Utilities

| File | Purpose | See Also |
|------|---------|----------|
| `src/environments/environment.ts` | **Central config**: `apiUrl` (RESTHeart Cloud service URL) + `features` object (feature flags) | [Auth & Teams](/openwiki/domain/auth-and-teams.md#feature-flags), [Operations](/openwiki/operations/runbook.md) |
| `src/just-signed-up.ts` | Module-level boolean flag. Set to `true` when `?flow=signup` query param is detected in fragment token capture. Shell reads and clears it to show a welcome message. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |
| `src/oauth-url.ts` | Builds OAuth authorize URL: `${apiUrl}/auth/oauth/authorize/${provider}?noauthchallenge` | [Auth & Teams](/openwiki/domain/auth-and-teams.md#oauth-login) |

## Styling

| File | Purpose | See Also |
|------|---------|----------|
| `src/styles.css` | **Design tokens** (section 1), reset/base styles (section 2), skin classes (section 3), utility classes (section 4), page scaffolds (section 5). Explicitly a disposable mockup — meant to be replaced. | [Operations](/openwiki/operations/runbook.md#design-system) |
| `src/vite-env.d.ts` | Vite client type reference | — |

## UI Components

| File | Purpose | See Also |
|------|---------|----------|
| `src/ui/alert/Alert.tsx` | Shared feedback component. Props: `type` ("error"/"success"), `children`, `onClose`, `dismissible?` (default `true`), `autoDismiss?` (default `4000`ms). Auto-dismisses after the timeout. Uses `.form-error` / `.success-msg` class hooks and correct ARIA roles (`alert` / `status`). | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |

## Page Components

### Shell (Authenticated Frame)

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/shell/Shell.tsx` | Authenticated layout: header with team name, nav links, user avatar dropdown menu (profile, account, theme toggle, logout), `<Outlet>` for child routes. Contains `useTheme()` hook for light/dark mode persisted to `localStorage`. | [Operations](/openwiki/operations/runbook.md#theming) |
| `src/pages/shell/Shell.css` | Shell-specific layout styles | — |

### Home

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/home/Home.tsx` | **Getting-started page**. Welcome hero, feature-flag status grid (on/off badges linked to team/account pages), 5-step customization guide, and an interactive `auth.api('/demo')` fetch demo. Replace with your own landing content. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#reading-your-own-data) |
| `src/pages/home/Home.css` | Home page styles | — |

### Auth Pages

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/auth/login/Login.tsx` | Email/password login form. Shows OAuth buttons if `oauthLogin` is enabled. Form validation (email format, required fields), error display, loading state. Reads `error` search param for `invalid_token` message. Links to signup and forgot-password. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#login) |
| `src/pages/auth/signup/Signup.tsx` | Registration form with first name, last name, email, password. Auto-generates team name. On success shows "Check your email" confirmation. OAuth buttons shown when enabled. Handles 409 duplicate email. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#signup) |
| `src/pages/auth/verify/Verify.tsx` | Email verification page. Reads `email`, `token`, and `error` from URL search params. Handles missing params and error states. Calls `auth.verify(email, token)` which returns a redirect URL. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#email-verification) |
| `src/pages/auth/forgot-password/ForgotPassword.tsx` | Request password reset email. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#password-reset) |
| `src/pages/auth/reset-password/ResetPassword.tsx` | Set new password using reset token from email link. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#password-reset) |
| `src/pages/auth/oauth-buttons/OAuthButtons.tsx` | Renders OAuth provider buttons (Google, GitHub). Builds URLs via `oauthUrl()`. Includes inline SVG icons for each provider. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#oauth-login) |
| `src/pages/auth/oauth-buttons/OAuthButtons.css` | OAuth button styles: flex column layout, bordered buttons with hover state, icon sizing | — |

### Invitations

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/invitations/accept/Accept.tsx` | **One page, three flows**: (1) missing params → error, (2) new user → set password form (`auth.activate()`), (3) existing user → login + accept (`auth.acceptInvite()`). No route guard — works signed-in or out. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#invitations) |

### Teams

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/teams/Teams.tsx` | Team list. Shows all user's teams with role, active badge, switch button. Links to team detail and new team. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#team-management) |
| `src/pages/teams/detail/TeamDetail.tsx` | Full team management: member list with role change/remove (owner), invite form, pending invitations with resend cooldown (5 min), team name/description settings, and delete team with confirmation dialog. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#team-detail-teamsid) |
| `src/pages/teams/new/NewTeam.tsx` | Create new team form. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#team-management) |
| `src/pages/teams/*.css` | Team-specific layout styles | — |

### Account

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/account/Account.tsx` | User profile management (first name, last name via `auth.updateProfile()`) + change password form (`auth.changePassword()`). Loads profile via `auth.checkSession()` on mount. | [Auth & Teams](/openwiki/domain/auth-and-teams.md#reading-your-own-data) |
| `src/pages/account/Account.css` | Account page styles | — |

## Server Setup & Consents Gate

| File | Purpose | See Also |
|------|---------|----------|
| `rhc.setup.ts` | **Service configuration script** for `@restheart-cloud/cli`. Defines idempotent steps to install and configure the accounts plugin, set feature flags (derived from `environment.ts`), configure Google OAuth credentials (when enabled), and add the app origin to the allowlist. Run with `rhc setup --srv <srvId>`. | [Operations](/openwiki/operations/runbook.md) |
| `rhc.setup.consents.ts` | **Extended setup script** that imports `rhc.setup.ts` and appends four consents-gate documents: a JSON Schema for user documents with `latestConsents`/`consents` fields, an ACL permission allowing users to PATCH their own consents (with `mergeRequest` that stamps versions), JWT claims for `latestConsents/tos` and `latestConsents/pp`, and a Guards rule that blocks authenticated users with `451` when either acceptance is missing. Versions are centralized as `TOS_VERSION` and `PP_VERSION`. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |
| `src/consents-signal.ts` | **Client-side consents signal**. Exports a reactive `blocked` flag with `isBlocked()`, `setBlocked()`, and `subscribe()`. The `consentsOnError` handler (passed to `RhAuthProvider` as `config.onError`) sets the flag on any `451` API response. Without it, a blocked user and a signed-out user are indistinguishable. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |
| `src/ConsentsGate.tsx` | **Blocking overlay component**. Wraps the router in `App.tsx` above `AuthGuard`. When `blocked` is true, replaces the entire app with a modal dialog requiring acceptance of Terms and Privacy Policy. Calls `auth.acceptConsents()` (which does `PATCH /users/{id}`, then `GET /token?renew=true`, then `GET /users/me`, then `setUser()`). Includes sign-out option that clears the flag. The overlay is UX, not enforcement — removing it with dev tools still leaves every request returning `451`. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |
| `src/ConsentsGate.css` | Styles for the consents overlay: fixed fullscreen backdrop (`z-index: 400`), centered card, checkbox layout, disabled button state, sign-out link | — |
| `public/terms.html` | **Placeholder Terms of Service**. Static HTML (no build step), served to anyone regardless of auth state. Carries `Version 2026-07-01` which must match `TOS_VERSION` in `rhc.setup.consents.ts` and the Guards rule. Includes theme detection from `localStorage` to match the app's light/dark preference. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |
| `public/privacy.html` | **Placeholder Privacy Policy**. Static HTML (no build step), served to anyone regardless of auth state. Carries `Version 2026-07-01` which must match `PP_VERSION` in `rhc.setup.consents.ts` and the Guards rule. Includes theme detection from `localStorage` to match the app's light/dark preference. | [Auth & Teams](/openwiki/domain/auth-and-teams.md) |

## CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/openwiki-update.yml` | GitHub Actions workflow: runs OpenWiki documentation update daily at 04:00 UTC, creates PR with changes |
| `AGENTS.md` / `CLAUDE.md` | Agent instruction files for OpenWiki documentation runs |
