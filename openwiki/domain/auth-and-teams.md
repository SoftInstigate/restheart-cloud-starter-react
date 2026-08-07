---
type: Domain
title: Auth & Teams
description: Detailed documentation of authentication flows (login, signup, OAuth, email verification, password reset), team management, invitation handling, and feature flags in the RESTHeart Cloud React starter.
tags: [auth, teams, invitations, oauth, feature-flags, domain]
---

# Auth & Teams

<!-- openwiki: broken internal link [architecture/overview.md#auth-provider] file "architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
This page documents every authentication and multi-tenancy flow implemented in the starter. All auth logic is provided by `@restheart-cloud/kit-react` through the [`RhAuthProvider`](architecture/overview.md#auth-provider) and the `useAuth()` hook.

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

Loading state disables the submit button. Password visibility toggle is provided.

### Signup

**Route:** `/auth/signup` · **Guard:** `PublicGuard` · **Shown when:** `emailRegistration || oauthLogin` · **File:** `src/pages/auth/signup/Signup.tsx`

Registration form collecting first name, last name, email, and password (minimum 8 characters). On submit, calls `auth.register({ teamName, firstName, lastName, email, password })` where `teamName` is auto-generated as `"${firstName}'s Team"`.

On success, the form is replaced in-place by a "Check your email" confirmation — the user must click the verification link to complete registration. A 409 error shows "An account with this email already exists."

If `oauthLogin` is enabled, OAuth buttons appear above the form. If `emailRegistration` is off but `oauthLogin` is on, only the OAuth buttons are shown (no email form).

### Email Verification

**Route:** `/auth/verify` · **Guard:** `PublicGuard` · **Shown when:** `emailRegistration` · **File:** `src/pages/auth/verify/Verify.tsx`

Handles the verification link from the signup confirmation email. Reads the verification token from URL search params and calls the kit's verification method.

### Password Reset

**Routes:** `/auth/forgot-password`, `/auth/reset-password` · **Guard:** `PublicGuard` · **Shown when:** `passwordReset`

Two-step flow:
1. **ForgotPassword** — user enters email, receives reset link
2. **ResetPassword** — user clicks email link with token, sets new password

### OAuth Login

**File:** `src/pages/auth/oauth-buttons/OAuthButtons.tsx`

OAuth is initiated by navigating to `${apiUrl}/auth/oauth/authorize/${provider}?noauthchallenge`. The `oauthUrl()` helper in `src/oauth-url.ts` builds this URL.

<!-- openwiki: broken internal link [architecture/overview.md#fragment-token-capture] file "architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
After the OAuth provider authenticates the user, they are redirected back with an access token in the URL **fragment** (`#access_token=...`). The [fragment token capture](architecture/overview.md#fragment-token-capture) in `App.tsx` picks this up.

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
- **Already logged in** → shows "Join {teamName}" with one-click "Join team" button that calls `auth.acceptInvite(token)`
- **Not logged in** → shows "Log in to join {teamName}" with password form, submit calls `auth.login(email, password)` then `auth.acceptInvite(token)`
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
- Active team gets a "current" badge
- Clicking any team row calls `auth.switchTeam(teamId)` (if not already active), then navigates to `/teams/:id`
- "New team" link at top
- Empty state: "You're not part of any team yet."

### Team Detail (`/teams/:id`)

The detail page is **owner-aware** — owners see management panels that members do not. On mount it loads teams, members (`auth.listTeamMembers()`), and pending invitations (`auth.listInvitations()`).

**Members section** (all users):
- Lists members with name, email, and role
- Owners can change a member's role via a `<select>` dropdown (`auth.updateMemberRole()`)
- Owners can remove members with a two-step confirmation (`auth.removeMember()`)

**Invite a team member** (owners only):
- Form with email and role (member/owner) fields
- Calls `auth.invite(email, role)`
- 409 → "This person is already a member of your team."

**Pending invitations** (owners only, shown when invitations exist):
- Lists invitations with email, role, creation date, expired status
- Resend button with 5-minute cooldown (`auth.resendInvite()`)
- Cooldown timer updates every 30 seconds

**Team settings** (owners only):
- Edit team name and description (`auth.updateTeam()`)
- Save button is disabled until form is dirty
- **Danger zone**: Delete team button with confirmation dialog (`auth.deleteTeam()`). After deletion, switches to the next available team or navigates to `/teams`.

### New Team (`/teams/new`)

Form with team name field. Calls `auth.createTeam(teamName)` and navigates to `/teams` on success.

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

## See Also

<!-- openwiki: broken internal link [architecture/overview.md] file "architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Architecture Overview](architecture/overview.md) — how the auth provider and routing work
<!-- openwiki: broken internal link [operations/runbook.md] file "operations/runbook.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Operations & Runbook](operations/runbook.md) — how to configure feature flags and environment
