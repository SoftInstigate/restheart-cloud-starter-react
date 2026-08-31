---
type: Guide
title: RESTHeart Cloud Starter — React
description: Quickstart guide for the RESTHeart Cloud React starter. Covers what the repo provides, how to set it up, and where to find documentation on architecture, domain logic, operations, and testing.
tags: [quickstart, react, restheart-cloud, starter]
verified:
  - by: openwiki/0.4.3
    at: 2026-08-31T10:59:30.610Z
sources:
  - id: openwiki-source-4e7cd7f381c92e8c5d89f5c1
    resource: repo://NOTES.md
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
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
generated: { by: "openwiki/0.4.3", at: "2026-08-31T10:59:30.610Z" }
---

# RESTHeart Cloud Starter — React

A React + TypeScript starter built on [`@restheart-cloud/kit-react`](https://github.com/SoftInstigate/restheart-cloud-kit/tree/main/packages/kit-react). It implements all RESTHeart Cloud auth and multi-tenancy flows out of the box — fork it, point it at your RESTHeart Cloud service, and start building.

Works for multi-tenant SaaS (invitations, team switcher) and simpler apps (auth only).

## What's Included

- **Signup, login, logout** — email/password and Google/GitHub OAuth
- **Email verification, password reset**
- **Team invitations** — one page (`/invitations/accept`) branching into a new-user "set password" form (calls `PATCH /auth/activate`) or an existing-user "log in and accept" form
- **Team switcher** — shown only when the user belongs to more than one team
- **Consents gate** — optional server-side enforcement requiring users to accept Terms of Service and Privacy Policy before using the app; the client reacts to `451` responses with a blocking overlay
- **Authenticated shell** with placeholder for your app content
- **Lazy-loaded routes** with code splitting

## Quick Setup

### Prerequisites

1. A **RESTHeart Cloud service** — [create one at cloud.restheart.com](https://cloud.restheart.com). Use a free service for development.
2. Node.js 18+

### Steps

```bash
# 1. Clone and install
git clone https://github.com/your-org/restheart-cloud-starter-react.git
cd restheart-cloud-starter-react
npm install

# 2. Point to your service (edit the file, then tell git to ignore local changes)
git update-index --assume-unchanged src/environments/environment.ts
# Edit src/environments/environment.ts → set apiUrl to your *.restheart.com URL

# 3. Run
npm run dev
```

### Server Setup

The app needs its RESTHeart Cloud service configured: the accounts plugin installed, sign-up and password reset switched on, your origin allowed. The `rhc` CLI applies this from a setup file in the repo — no console checklist to follow.

```bash
npm install -g @restheart-cloud/cli
rhc login                              # paste a token from cloud.restheart.com
rhc setup --srv <srvId>                # applies rhc.setup.ts
```

`rhc.setup.ts` imports the same `environment.ts` the app uses, so feature flags are stated once. Every step is a check-and-apply — running it twice writes nothing. `--dry-run` reports what a service is missing without touching it.

**Want users to accept Terms and Privacy Policy first?** Use the consents setup file instead:

```bash
rhc setup --srv <srvId> --file rhc.setup.consents.ts
```

`rhc.setup.consents.ts` imports `rhc.setup.ts` and appends four documents (schema, permission, JWT claims, Guards rule) that enforce consents acceptance server-side. Applying it to a service already set up with `rhc.setup.ts` adds the gate and touches nothing else. Skip the file and nobody is ever asked — the acceptance dialog is waiting for a `451` that never comes.

Either way, replace `public/terms.html` and `public/privacy.html` — they are placeholders.

### NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then produce `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run tests with Vitest |

## Project Structure

```
src/
  main.tsx                ← Entrypoint: RhAuthProvider + BrowserRouter
  App.tsx                 ← Fragment token capture + config gate + ConsentsGate wrapper
  routes.tsx              ← Route map with lazy loading and feature-flag gating
  ConfigPage.tsx          ← Shown when apiUrl is not a valid *.restheart.com URL
  styles.css              ← Design tokens + the DISPOSABLE default skin
  just-signed-up.ts       ← Module-level flag for post-signup welcome
  oauth-url.ts            ← OAuth authorize URL builder
  consents-signal.ts      ← 451 flag + onError handler that raises it
  ConsentsGate.tsx        ← Blocking overlay, mounted above AuthGuard in App.tsx
  environments/
    environment.ts        ← apiUrl + feature flags
  ui/alert/               ← Shared feedback component
  pages/
    shell/                ← Authenticated frame: header, nav, user menu, theme toggle
    home/                 ← Getting-started showcase with feature flags grid and auth.api() demo — replace with your content
    auth/                 ← login, signup, verify, forgot/reset password, OAuth buttons
    invitations/accept/   ← One page, three flows (new user, logged-in, missing params)
    teams/                ← list, detail (members/invites/settings), new
    account/              ← Profile + change password
public/
  terms.html, privacy.html ← Placeholder legal documents — replace them
```

## Documentation Map

| Page | What It Covers |
|------|----------------|
| [Architecture Overview](/openwiki/architecture/overview.md) | Component tree, auth provider setup, routing strategy, fragment token capture, config gating, consents gate overlay system |
| [Source Map](/openwiki/source-map.md) | File-by-file inventory mapping every source file to its purpose |
| [Auth & Teams](/openwiki/domain/auth-and-teams.md) | Authentication flows, team management, invitation handling, consents acceptance, feature flags |
| [Operations & Runbook](/openwiki/operations/runbook.md) | Environment config, server setup with `rhc` CLI, design system/styling, build/deploy, consents gate server-side setup |
| [Testing Guidance](/openwiki/testing/guidance.md) | Vitest setup, what to test, how to run |

## Key Dependencies

| Package | Role |
|---------|------|
| `@restheart-cloud/kit-react` | Auth provider (`RhAuthProvider`), guards (`AuthGuard`, `PublicGuard`), `useAuth()` hook, token management |
| `@restheart-cloud/kit` | Framework-agnostic RESTHeart Cloud API client |
| `react-router-dom` ^6.28 | Routing with `useRoutes`, lazy loading, nested routes |
| `vite` ^6.0 | Build tool and dev server |
| `vitest` ^2.0 | Test runner (no test files yet — see [Testing Guidance](/openwiki/testing/guidance.md)) |

## Backlog

- **No test files exist** — Vitest is configured but no `.test.ts` or `.spec.ts` files have been written. Source anchor: `package.json` → `"test": "vitest"`. Deferred because the project is in its initial commit phase.
- **Account page** (`pages/account/Account.tsx`) provides profile and password management — extend as needed.
- **Additional OAuth providers** — currently only `google` is configured; the environment supports `oauthProviders` array for GitHub, etc.
