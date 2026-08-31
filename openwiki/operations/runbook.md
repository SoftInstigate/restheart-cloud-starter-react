---
type: Runbook
title: Operations & Runbook
description: Environment configuration, server setup with rhc CLI, design system, theming, build/deploy, and the consents gate server-side setup.
tags: [operations, runbook, config, styling, build, deploy, theming, server-setup, consents]
verified:
  - by: openwiki/0.4.3
    at: 2026-08-31T10:59:30.610Z
sources:
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-85dc2a049a0943b56218c045
    resource: repo://public/privacy.html
  - id: openwiki-source-ad504d4d06a9b4cc6851d32b
    resource: repo://public/terms.html
  - id: openwiki-source-cec027055a927c253ba22cff
    resource: repo://rhc.setup.consents.ts
  - id: openwiki-source-61cc9cbff8e3e2bb34c724a6
    resource: repo://rhc.setup.ts
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-d246777daf29ea6fdf9f8b53
    resource: repo://src/pages/shell/Shell.tsx
  - id: openwiki-source-146419bb9b2415894a6bd677
    resource: repo://src/styles.css
generated: { by: "openwiki/0.4.3", at: "2026-08-31T10:59:30.610Z" }
---

# Operations & Runbook

## Environment Configuration

**File:** `src/environments/environment.ts`

This is the single configuration file for the starter. It contains:

```typescript
export const environment = {
  apiUrl: '<your-restheart-cloud-servie-url>',
  features: {
    emailRegistration: true,
    passwordReset: true,
    oauthLogin: true,
    oauthProviders: ['google'] as const,
    teamInvitations: true,
  },
};
```

### apiUrl

Must be a valid `*.restheart.com` URL. The app validates this on startup with `isValidApiBaseUrl()` from the kit. If invalid, a [ConfigPage](/openwiki/architecture/overview.md#config-gating) is shown instead of the app.

**After cloning**, tell git to ignore local changes:

```bash
git update-index --assume-unchanged src/environments/environment.ts
```

Then edit the file to point to your own service.

### Feature Flags

See [Auth & Teams — Feature Flags](/openwiki/domain/auth-and-teams.md#feature-flags) for the complete reference. These must match your RESTHeart Cloud service's toggles.

## Server Setup

The starter uses the `@restheart-cloud/cli` (rhc CLI) to configure its RESTHeart Cloud service. Two setup files define the server-side configuration:

- **`rhc.setup.ts`** — basic accounts configuration
- **`rhc.setup.consents.ts`** — extends the basic setup with the consents gate

### rhc CLI Workflow

```bash
npm i -D @restheart-cloud/cli
rhc login
rhc setup --srv <srvId> --dry-run    # what is missing
rhc setup --srv <srvId>              # make it so
```

Every step is a `check` and an `apply`: run it against a service already configured and it writes nothing and reports each step satisfied. `--dry-run` runs the checks only, which is the honest answer to "what is this service missing".

### rhc.setup.ts — Basic Accounts Configuration

**File:** `rhc.setup.ts`

This file configures the accounts plugin and derives server feature flags from the app's `environment.ts`. It imports the same `environment` object the app uses, so the flags are stated once.

#### What it configures:

1. **Accounts plugin installation** — installs the `accounts` plugin if not present
2. **Accounts configuration** — sets `app-name`, `frontend-url`, and feature toggles derived from `environment.features`:
   - `registration` and `verification` from `emailRegistration`
   - `password-reset` from `passwordReset`
   - `invitations` from `teamInvitations`
   - `oauth` from `oauthLogin`
3. **Google OAuth credentials** (conditional) — only when `oauthLogin` is enabled and `'google'` is in `oauthProviders`. Uses `fromEnv('GOOGLE_CLIENT_ID')` and `fromEnv('GOOGLE_CLIENT_SECRET')` to read credentials from environment variables, but only when not already stored on the service.
4. **Origin allowlist** — installs the `origin-allowlist` plugin and adds `APP_URL` (defaults to `http://localhost:5173`) to the allowed origins. Origins are added, never replaced, so a service reached from multiple origins keeps both.

#### Environment variables:

- `APP_URL` — where the app is served from (default: `http://localhost:5173`)
- `APP_NAME` — shown in verification, reset and invitation emails (default: `RESTHeart Cloud Starter`)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID (only when needed)
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret (only when needed)

### rhc.setup.consents.ts — Consents Gate Setup

**File:** `rhc.setup.consents.ts`

This file extends `rhc.setup.ts` with the consents gate's four server-side documents. It imports the accounts steps and appends:

1. **User schema** — validates the `users` collection with `userConsentsSchema`. Requires `_id`, `password`, `roles`, `profile`; optionally allows `latestConsents`, `consents`, `teams`, `team`, `socialAuths`. The schema uses `_$date` (escaped) for BSON date fields.

2. **Users collection validation** — attaches the schema to the `/users` collection via its `_meta` endpoint.

3. **Acceptance permission** — creates `userCanPatchOwnConsents` permission that authorizes `PATCH /users/{userId}` with `bson-request-whitelist(consents)`. The server stamps `latestConsents` and pushes to the `consents` history array via `mergeRequest`.

4. **JWT claims** — adds `latestConsents/tos` and `latestConsents/pp` to `account-properties-claims` so the guard can read them from the JWT without a database query.

5. **Guards rule** — installs the `consentsGate` rule with status `451` and a version-based condition that blocks users who haven't accepted the current versions.

#### Version management:

The versions live in one place as `TOS_VERSION` and `PP_VERSION` constants. Everything is derived from them. The versions must agree in three places:

1. **Setup file** — `TOS_VERSION` and `PP_VERSION` constants in `rhc.setup.consents.ts`
2. **Guards rule condition** — the rule compares `@user.latestConsents.tos` and `@user.latestConsents.pp` against these versions
3. **Public HTML files** — `public/terms.html` and `public/privacy.html` display the version dates

If they don't agree, the failure is quiet: a user accepts, the acceptance is stamped with one version, the rule compares against another, and they are blocked forever by a form that says it worked.

#### What it deliberately does not do:

It does not write the Terms or the Privacy Policy — those are `public/`, and they are yours. It only decides which *versions* the service demands.

## Design System

**File:** `src/styles.css`

The stylesheet is structured in five sections, all clearly marked with comments:

| Section | Content |
|---------|---------|
| 1. Design tokens | CSS custom properties — the single source of color, type, space, and shape |
| 2. Reset & base | Minimal reset and base element styles |
| 3. Skin classes | Component classes (`.card`, `.btn-primary`, `.form-field`, `.auth-page`, etc.) |
| 4. Utility classes | Helpers (`.muted`, `.eyebrow`, `.field-error`, etc.) |
| 5. Page scaffolds | Layout scaffolds for specific page types |

### Design Tokens

All colors, spacing, and typography flow from CSS custom properties in `:root`. Key tokens:

```css
--color-primary: #f8a839;       /* RESTHeart amber — primary actions */
--color-link: #1f6f54;          /* Teal — links and success */
--color-bg: #f4f6f8;            /* Page background */
--color-surface: #ffffff;       /* Card/surface background */
--color-text: #14171c;          /* Primary text */
--color-text-muted: #656d7a;    /* Secondary text */
```

### The "Blueprint" Design Language

The default skin is deliberately a **mockup**, not a finished product:

- Flat, crisp surfaces — borders and typography carry the design
- Squared-off radii with a faint dot grid (drafting-sheet aesthetic)
- Small uppercase monospace for UI chrome (labels, back links)
- One accent (amber) for primary actions, teal for links/success

### Two Ways to Customize

1. **Tweak it** — change tokens in section 1, skin classes in section 3
2. **Replace it** — adopt Material / Tailwind / your own: delete sections 3–5 and reskin using the stable vocabulary of semantic class hooks (`.card`, `.btn-primary`, `.form-field`, etc.)

## Theming

**File:** `src/pages/shell/Shell.tsx` (contains `useTheme()` hook)

Light/dark mode is implemented as a hook in the Shell component:

```typescript
const STORAGE_KEY = 'rh-theme';

function useTheme() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { dark, toggle };
}
```

- Preference is persisted to `localStorage` under key `rh-theme`
- Toggling adds/removes the `dark` class on `<html>`
- Override tokens for `.dark` in `styles.css` to implement dark mode colors

The toggle button is in the user avatar dropdown menu in the Shell header.

## Build & Deploy

### Development

```bash
npm install
npm run dev      # Vite dev server with HMR
```

### Production Build

```bash
npm run build    # Runs tsc -b (type checking) then vite build
npm run preview  # Serve dist/ locally for testing
```

The build produces static files in `dist/`. Deploy this directory to any static hosting (Netlify, Vercel, Cloudflare Pages, S3+CloudFront, etc.).

### CI/CD

**File:** `.github/workflows/openwiki-update.yml`

A GitHub Actions workflow runs OpenWiki documentation updates on a schedule. This does not affect the application build.

## Page-Specific Stylesheets

Each page directory under `src/pages/` contains its own CSS file (e.g., `Shell.css`, `Teams.css`, `Account.css`). These hold **page-specific layout only** — all design tokens and shared styles live in `src/styles.css`.

## See Also

- [Architecture Overview](/openwiki/architecture/overview.md) — component tree and config gating
- [Auth & Teams](/openwiki/domain/auth-and-teams.md) — feature flag definitions
- [Testing Guidance](/openwiki/testing/guidance.md) — running tests
