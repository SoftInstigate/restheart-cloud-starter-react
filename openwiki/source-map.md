---
type: Source Map
title: Source Map
description: File-by-file inventory of the RESTHeart Cloud React starter, mapping every source file to its purpose and cross-referencing documentation.
tags: [source-map, reference, files]
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
| `starter-home-page.png` | Screenshot of the home page used in `README.md` | — |

## Entrypoint & App Shell

| File | Purpose | See Also |
|------|---------|----------|
| `src/main.tsx` | React root creation. Renders `<StrictMode>` → `<BrowserRouter>` → `<RhAuthProvider>` → `<App />`. Imports `styles.css`. | [Architecture](architecture/overview.md) |
| `src/App.tsx` | Fragment token capture on mount, API URL validation gate, renders `ConfigPage` or route tree via `useRoutes()` | [Architecture](architecture/overview.md) |
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
| `src/ui/alert/Alert.tsx` | Shared feedback component. Props: `type` ("error"/"success"), `children`, `onClose`, `dismissible` (default true), `autoDismiss` (default 4000ms). Auto-dismisses after timeout. Used across auth and invitation pages. | [Auth & Teams](domain/auth-and-teams.md) |

## Page Components

### Shell (Authenticated Frame)

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/shell/Shell.tsx` | Authenticated layout: skip-link, nav progress bar, header with logo, main nav (Home, Teams), theme toggle button (standalone in header actions), user avatar dropdown menu (account, logout), welcome banner for new signups, `<Outlet>` for child routes. Contains `useTheme()` hook for light/dark mode persisted to `localStorage`. | [Operations](operations/runbook.md#theming) |
| `src/pages/shell/Shell.css` | Shell-specific layout styles | — |

### Home

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/home/Home.tsx` | Feature showcase page. Displays user greeting, capability grid (each feature shows on/off status based on flags), and a five-step "Make it yours" onboarding checklist. | [Auth & Teams](domain/auth-and-teams.md#feature-flags) |
| `src/pages/home/Home.css` | Home page styles | — |

### Auth Pages

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/auth/login/Login.tsx` | Email/password login form. Shows OAuth buttons if `oauthLogin` is enabled. Form validation (email format, required fields), error display, loading state. Password visibility toggle. Reads `?error=invalid_token` from URL params to show link-expired message. Links to signup and forgot-password. | [Auth & Teams](domain/auth-and-teams.md#login) |
| `src/pages/auth/signup/Signup.tsx` | Registration form with first name, last name, email, password (min 8 chars). Auto-generates team name. On success, shows "Check your email" confirmation. 409 → "An account with this email already exists." | [Auth & Teams](domain/auth-and-teams.md#signup) |
| `src/pages/auth/verify/Verify.tsx` | Email verification page. Reads verification token from URL params. | [Auth & Teams](domain/auth-and-teams.md#email-verification) |
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
| `src/pages/teams/Teams.tsx` | Team list. Shows all user's teams with name, description, role. Active team gets a "current" badge. Clicking a team switches to it (if inactive) and navigates to detail. "New team" link at top. | [Auth & Teams](domain/auth-and-teams.md#team-management) |
| `src/pages/teams/detail/TeamDetail.tsx` | Team detail view with **owner-aware** panels: members list with role management and removal, invite form with email and role, pending invitations with resend (5-min cooldown), team settings (name/description editing), and danger zone (delete team with confirmation). Loads members via `auth.listTeamMembers()` and invitations via `auth.listInvitations()`. | [Auth & Teams](domain/auth-and-teams.md#team-management) |
| `src/pages/teams/new/NewTeam.tsx` | Create new team form. | [Auth & Teams](domain/auth-and-teams.md#team-management) |
| `src/pages/teams/*.css` | Team-specific layout styles | — |

### Account

| File | Purpose | See Also |
|------|---------|----------|
| `src/pages/account/Account.tsx` | User profile management (first name, last name via `auth.updateProfile()`, email displayed read-only from `auth.user._id`) + change password form (`auth.changePassword(current, new)`). Loads profile via `auth.checkSession()` on mount. | [Auth & Teams](domain/auth-and-teams.md) |
| `src/pages/account/Account.css` | Account page styles | — |

## CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/openwiki-update.yml` | GitHub Actions workflow: runs OpenWiki documentation update every 3 days at 04:29 UTC, creates PR with changes |
| `AGENTS.md` / `CLAUDE.md` | Agent instruction files for OpenWiki documentation runs |
