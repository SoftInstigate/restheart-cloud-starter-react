---
type: Guide
title: RESTHeart Cloud Starter — React
description: Quickstart guide for the RESTHeart Cloud React starter. Covers what the repo provides, how to set it up, and where to find documentation on architecture, domain logic, operations, and testing.
tags: [quickstart, react, restheart-cloud, starter]
---

# RESTHeart Cloud Starter — React

A React + TypeScript starter built on [`@restheart-cloud/kit-react`](https://github.com/SoftInstigate/restheart-cloud-kit/tree/main/packages/kit-react). It implements all RESTHeart Cloud auth and multi-tenancy flows out of the box — fork it, point it at your RESTHeart Cloud service, and start building.

Works for multi-tenant SaaS (invitations, team switcher) and simpler apps (auth only).

## What's Included

- **Signup, login, logout** — email/password and Google/GitHub OAuth
- **Email verification, password reset**
- **Team invitations** — one page (`/invitations/accept`) branching into a new-user "set password" form (calls `PATCH /auth/activate`) or an existing-user "log in and accept" form
- **Team switcher** — shown only when the user belongs to more than one team
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
  App.tsx                 ← Fragment token capture + config gate
  routes.tsx              ← Route map with lazy loading and feature-flag gating
  ConfigPage.tsx          ← Shown when apiUrl is not a valid *.restheart.com URL
  styles.css              ← Design tokens + the DISPOSABLE default skin
  just-signed-up.ts       ← Module-level flag for post-signup welcome
  oauth-url.ts            ← OAuth authorize URL builder
  environments/
    environment.ts        ← apiUrl + feature flags
  ui/alert/               ← Shared feedback component
  pages/
    shell/                ← Authenticated frame: header, nav, user menu, theme toggle
    home/                 ← PLACEHOLDER showcase — replace with your content
    auth/                 ← login, signup, verify, forgot/reset password, OAuth buttons
    invitations/accept/   ← One page, three flows (new user, logged-in, missing params)
    teams/                ← list, detail (members/invites/settings), new
    account/              ← Profile + change password
```

## Documentation Map

| Page | What It Covers |
|------|----------------|
| [Architecture Overview](architecture/overview.md) | Component tree, auth provider setup, routing strategy, fragment token capture, config gating |
| [Source Map](source-map.md) | File-by-file inventory mapping every source file to its purpose |
| [Auth & Teams](domain/auth-and-teams.md) | Authentication flows, team management, invitation handling, feature flags |
| [Operations & Runbook](operations/runbook.md) | Environment config, design system/styling, build/deploy, feature flag management |
| [Testing Guidance](testing/guidance.md) | Vitest setup, what to test, how to run |

## Key Dependencies

| Package | Role |
|---------|------|
| `@restheart-cloud/kit-react` | Auth provider (`RhAuthProvider`), guards (`AuthGuard`, `PublicGuard`), `useAuth()` hook, token management |
| `@restheart-cloud/kit` | Framework-agnostic RESTHeart Cloud API client |
| `react-router-dom` ^6.28 | Routing with `useRoutes`, lazy loading, nested routes |
| `vite` ^6.0 | Build tool and dev server |
| `vitest` ^2.0 | Test runner (no test files yet — see [Testing Guidance](testing/guidance.md)) |

## Backlog

- **No test files exist** — Vitest is configured but no `.test.ts` or `.spec.ts` files have been written. Source anchor: `package.json` → `"test": "vitest"`. Deferred because the project is in its initial commit phase.
- **Team detail page** (`pages/teams/detail/TeamDetail.tsx`) exists but may need richer member/invite/settings management UI depending on requirements.
- **Account page** (`pages/account/Account.tsx`) provides profile and password management — extend as needed.
- **Additional OAuth providers** — currently only `google` is configured; the environment supports `oauthProviders` array for GitHub, etc.
