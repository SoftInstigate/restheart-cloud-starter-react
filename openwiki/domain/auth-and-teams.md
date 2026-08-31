---
type: Domain
title: Auth & Teams
description: Detailed documentation of authentication flows (login, signup, OAuth, email verification, password reset), team management, invitation handling, consents acceptance, and feature flags in the RESTHeart Cloud React starter.
tags: [auth, teams, invitations, oauth, feature-flags, consents, domain]
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
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-440d3aa4e5dbdff8211c15e3
    resource: repo://src/just-signed-up.ts
  - id: openwiki-source-62327449da47479a80c27d31
    resource: repo://src/oauth-url.ts
  - id: openwiki-source-5f5ab9debc6f9b32eab997bb
    resource: repo://src/pages/account/Account.tsx
  - id: openwiki-source-69233b952dc2ecb1c3d6e3c1
    resource: repo://src/pages/auth/forgot-password/ForgotPassword.tsx
  - id: openwiki-source-c9161dbd621f22e3073aa0a1
    resource: repo://src/pages/auth/login/Login.tsx
  - id: openwiki-source-218c8734c88d36610ad967a5
    resource: repo://src/pages/auth/oauth-buttons/OAuthButtons.tsx
  - id: openwiki-source-bbbc426be9a626165e738dce
    resource: repo://src/pages/auth/reset-password/ResetPassword.tsx
  - id: openwiki-source-9b67846f4bc6291f7850560e
    resource: repo://src/pages/auth/signup/Signup.tsx
  - id: openwiki-source-599eb255d8fa329c9092fdcb
    resource: repo://src/pages/auth/verify/Verify.tsx
  - id: openwiki-source-25246136842acdbaf0ab42fd
    resource: repo://src/pages/invitations/accept/Accept.tsx
  - id: openwiki-source-d246777daf29ea6fdf9f8b53
    resource: repo://src/pages/shell/Shell.tsx
  - id: openwiki-source-e31f18ccf81f23fb0b5d1a06
    resource: repo://src/pages/teams/detail/TeamDetail.tsx
  - id: openwiki-source-d5277d8efe8978259c7811b5
    resource: repo://src/pages/teams/Teams.tsx
  - id: openwiki-source-07aa4341cebe71bfc8fd2890
    resource: repo://src/routes.tsx
generated: { by: "openwiki/0.4.3", at: "2026-08-31T10:59:30.610Z" }
---

# Auth & Teams

This page documents every authentication and multi-tenancy flow implemented in the starter. All auth logic is provided by `@restheart-cloud/kit-react` through the `RhAuthProvider` and the `useAuth()` hook.

## Authentication Flows

### Login

**Route:** `/auth/login` · **Guard:** `PublicGuard` · **File:** `src/pages/auth/login/Login.tsx`

The login page renders:
1. **OAuth buttons** (if `oauthLogin` feature flag is on) via the `OAuthButtons` component
2. An "OR" divider
3. **Email/password form** with inline validation:
   - Email: must contain `@` (checked on blur)
   - Password: required (checked on blur)
   - Submit calls `auth.login(email, password)`, then `navigate('/')`
   - 401 → "Invalid email or password."
   - Other errors → displays the error message
4. Links to signup (`/auth/signup`) and forgot password (`/auth/forgot-password`)

The page also checks for an `error` search param on load — if `error=invalid_token`, it shows "This link is invalid or has expired." (used when the kit redirects back after a failed OAuth or token flow).

Loading state disables the submit button. Password visibility toggle is provided.

### Signup

**Route:** `/auth/signup` · **Guard:** `PublicGuard` · **Shown when:** `emailRegistration || oauthLogin` · **File:** `src/pages/auth/signup/Signup.tsx`

Registration form collecting first name, last name, email, and password (minimum 8 characters). OAuth buttons are shown above the form when `oauthLogin` is enabled. On submit:

1. Auto-generates a team name: `{firstName}'s Team`
2. Calls `auth.register({ teamName, firstName, lastName, email, password })`
3. On success → shows a "Check your email" confirmation screen (no redirect)
4. On 409 → "An account with this email already exists."

The [`justSignedUp`](#just-signed-up-flag) flag exists in `App.tsx` for cases where an external flow (e.g., OAuth callback) sets `?flow=signup` in the URL, but the signup form itself does not trigger it.

### Email Verification

**Route:** `/auth/verify` · **Guard:** `PublicGuard` · **Shown when:** `emailRegistration` · **File:** `src/pages/auth/verify/Verify.tsx`

Handles the verification link from the signup confirmation email. Reads `email`, `token`, and `error` from URL search params:

1. **Missing params** (`email` or `token` absent) → shows "Invalid link" with a back-to-login link
2. **Error param present** → shows "Verification failed — link is invalid or has expired"
3. **Valid params** → calls `auth.verify(email, token)`, which returns a URL, then redirects the browser to it (`window.location.href = url`)

### Password Reset

**Routes:** `/auth/forgot-password`, `/auth/reset-password` · **Guard:** `PublicGuard` · **Shown when:** `passwordReset`

Two-step flow:
1. **ForgotPassword** (`src/pages/auth/forgot-password/ForgotPassword.tsx`) — user enters email. The API returns 202 regardless of whether the email exists (to avoid leaking registered addresses). On submit → shows "Check your email" confirmation. Calls `auth.forgotPassword(email)`.
2. **ResetPassword** (`src/pages/auth/reset-password/ResetPassword.tsx`) — user clicks email link with `?email=...&token=...` query params. If params are missing → "Invalid link". Otherwise shows a password form (minimum 8 characters). Calls `auth.resetPassword({ email, token, password })`. On 401 → "This reset link is invalid or has expired." On success → navigates to `/`.

### OAuth Login

**File:** `src/pages/auth/oauth-buttons/OAuthButtons.tsx`

OAuth is initiated by navigating to `${apiUrl}/auth/oauth/authorize/${provider}?noauthchallenge`. The `oauthUrl()` helper in `src/oauth-url.ts` builds this URL.

After the OAuth provider authenticates the user, they are redirected back with an access token in the URL **fragment** (`#access_token=...`). The fragment token capture in `App.tsx` picks this up — `consumeFragmentToken()` reads the hash, extracts `access_token`, calls `setToken()` and `scheduleRefresh()`, then strips the fragment from the URL.

**Supported providers:** Configured in `environment.features.oauthProviders` array. Currently `['google']`. Add `'github'` or others as your RESTHeart Cloud service supports them.

## Invitations

**Route:** `/invitations/accept` · **Guard:** none (works signed-in or out) · **Shown when:** `teamInvitations` · **File:** `src/pages/invitations/accept/Accept.tsx`

Invitation links arrive via email with `?email=...&token=...` query params. The page handles three cases:

### Flow 1: Missing Parameters

If `email` or `token` is missing from the URL, an "Invalid invitation link" error is shown immediately.

### Flow 2: New User (not yet registered)

On load, `auth.getInvitation(email, token)` is called. If `invitation.isNewUser === true`:
- Shows "Join {teamName}" heading
- Password form (minimum 8 characters) with inline validation
- Submit calls `auth.activate({ email, token, password })` which both creates the account and accepts the invitation
- On success → navigates to `/`

### Flow 3: Existing User

If `invitation.isNewUser === false`:
- Shows "Accept invitation to {teamName}"
- If already logged in → one-click "Accept" button calls `auth.acceptInvite(token)`
- If not logged in → password form, submit logs in then calls `auth.acceptInvite(token)`
- On success → shows "You're in" and redirects to `/` after 1.2 seconds

Error handling:
- 404 → "This invitation is invalid or has expired."
- 401 → "Invalid password."
- Other → display the error message

## Team Management

**Files:** `src/pages/teams/Teams.tsx`, `src/pages/teams/detail/TeamDetail.tsx`, `src/pages/teams/new/NewTeam.tsx`

### Team List (`/teams`)

- Calls `auth.loadTeams()` on mount
- Renders each team with name, description, role
- Active team gets a "current" badge; inactive teams get a "Switch" button
- "New team" link at top
- Empty state: "You're not part of any team yet."

### Team Switching

`auth.switchTeam(teamId)` — called from the team list. The team switcher in the Shell header is only shown when the user belongs to more than one team.

### Team Detail (`/teams/:id`)

**File:** `src/pages/teams/detail/TeamDetail.tsx`

Full team management page, owner-only sections are gated by `team.role === 'owner'`:

- **Members** — lists all team members with name, email, and role. Owners can change member roles (member ↔ owner) and remove members (with confirmation).
- **Invite a team member** (owner only) — form with email and role selection. Calls `auth.invite(email, role)`. Shows 409 error for duplicate members.
- **Pending invitations** (owner only) — lists pending invites with role, date, and expired status. "Resend" button with a 5-minute cooldown per invite.
- **Team settings** (owner only) — form to edit team name and description. Calls `auth.updateTeam()`.
- **Delete team** (owner only) — confirmation dialog, calls `auth.deleteTeam()`, then loads remaining teams and switches to the first one.

All data loads via `auth.listTeamMembers()` and `auth.listInvitations()` on mount alongside `auth.loadTeams()`.

### New Team (`/teams/new`)

**File:** `src/pages/teams/new/NewTeam.tsx`

Form to create a new team. Calls `auth.createTeam(teamName)` and navigates to `/teams` on success.

## Account Management

**Route:** `/account` · **Guard:** `AuthGuard` · **File:** `src/pages/account/Account.tsx`

Two sections for managing the authenticated user's own data:

### Profile

- Loads current profile via `auth.checkSession()` on mount
- Editable fields: first name, last name
- Email is displayed but read-only (shown as disabled input)
- Calls `auth.updateProfile({ firstName, lastName })` on save
- Success → "Profile updated!" alert; error → displays message

### Change Password

- Current password and new password fields (minimum 8 characters)
- Password visibility toggles on both fields
- Calls `auth.changePassword(currentPassword, newPassword)`
- Success → "Password changed!" alert, fields cleared; error → displays message

## Consents Gate

The consents gate is a server-side enforcement mechanism that blocks authenticated users who have not accepted the current Terms of Service and Privacy Policy. It requires no feature flag — the gate is active whenever a Guards rule exists on the service, and absent when it does not.

### How It Works

1. **Server-side rule:** A RESTHeart Guards plugin rule answers `451 Unavailable For Legal Reasons` to every authenticated request from a user whose `latestConsents.tos` or `latestConsents.pp` does not match the current version strings. The rule exempts `/auth/*`, `/token/*`, and the acceptance PATCH itself.

2. **Client-side detection:** `src/consents-signal.ts` exports a `consentsOnError` callback passed to `RhAuthProvider` as `config.onError`. When any API call returns status `451`, it sets a module-level `blocked` flag and notifies listeners.

3. **Overlay:** `ConsentsGate` (`src/ConsentsGate.tsx`) sits above the router in `App.tsx`. It subscribes to the blocked signal and, when blocked, replaces the entire app with an acceptance dialog. This placement is critical — a blocked user has no valid session, so `AuthGuard` would bounce them to login before they could ever see the acceptance form.

4. **Acceptance flow:** When the user checks both boxes and clicks "I accept":
   - `auth.acceptConsents()` sends a PATCH to `/users/{userId}` with `{"consents": []}` — the client states nothing about versions; the server's permission stamps the current versions and timestamp via `mergeRequest`
   - `auth.checkSession()` reloads the user document (now that `/users/me` is unblocked)
   - The blocked flag is cleared and the app renders normally

5. **Sign out:** The "Sign out" button clears the blocked flag and calls `auth.logout()`, preventing the overlay from persisting for the next user on the same tab.

### Document Pages

The Terms of Service and Privacy Policy are static HTML pages served from `public/terms.html` and `public/privacy.html`. They open in a new tab from links in the acceptance dialog. Both pages mirror the app's theme (light/dark) by reading `localStorage.getItem('rh-theme')` before first paint.

### Server Setup

The consents gate is configured by `rhc.setup.consents.ts`, which extends the base `rhc.setup.ts` with four additional steps:

1. **User schema** — validates the `users` collection, requiring `_id`, `password`, `roles`, `profile`; optionally allowing `latestConsents`, `consents`, `teams`, `team`
2. **Acceptance permission** — authorizes `PATCH /users/{userId}` with `bson-request-whitelist(consents)`, stamping `latestConsents` and pushing to the `consents` history array
3. **Token claims** — adds `latestConsents/tos` and `latestConsents/pp` to `account-properties-claims` so the guard can read them from the JWT without a database query
4. **Guard rule** — installs the `consentsGate` rule with status `451` and the version-based condition

Version strings (`TOS_VERSION`, `PP_VERSION`) are defined once in `rhc.setup.consents.ts` and derived everywhere else. Bump them and re-run `rhc setup` to require all users to accept again.

## Just-Signed-Up Flag

**File:** `src/just-signed-up.ts`

A simple module-level boolean:
- `setJustSignedUp(true)` is called in `App.tsx` when `?flow=signup` is detected
- Shell reads `isJustSignedUp()` on mount to show a welcome message
- Shell calls `setJustSignedUp(false)` immediately after reading (one-shot)

This avoids passing state through React context for a transient UI effect.

## Feature Flags

**File:** `src/environments/environment.ts`

```typescript
features: {
  emailRegistration: true,    // Enables signup + email verification routes
  passwordReset: true,        // Enables forgot-password + reset-password routes
  oauthLogin: true,           // Enables OAuth buttons on login/signup
  oauthProviders: ['google'], // Which OAuth providers to show
  teamInvitations: true,      // Enables /invitations/accept route
}
```

These flags must match your RESTHeart Cloud service's **Sign-up Mgmt → Features** toggles. When a flag is `false`:
- The corresponding route is removed from the route array
- UI elements (links, buttons) that reference the disabled flow are not rendered

The `rhc.setup.ts` file imports the same `environment` object and derives the server's feature toggles from it, so the flags are stated once.

## Reading Your Own Data

Everything the starter does talks to `/auth/*`, `/token`, and `/users/me` — the kit handles those. For your application's own collections, use `auth.api()`:

```tsx
import { useAuth } from '@restheart-cloud/kit-react';

function Notes() {
  const auth = useAuth();
  const [notes, setNotes] = useState<unknown[]>([]);

  useEffect(() => {
    auth.api('/notes?pagesize=10')
      .then(res => res.json())
      .then(setNotes)
      .catch((err) => console.error(err));
  }, [auth.api]);

  // ...
}
```

Pass a path, not a full URL. `auth.api()` attaches the bearer token automatically and rejects non-2xx responses with `ApiError({ status, message })`. A plain `fetch` to the same URL is unauthenticated — the service answers 401.

## See Also

- [Source Map](/openwiki/source-map.md) — file-by-file index of the starter
- [Operations & Runbook](/openwiki/operations/runbook.md) — how to configure feature flags and environment
