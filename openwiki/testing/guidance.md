---
type: Guide
title: Testing Guidance
description: Vitest setup, recommended test strategy, what to test, and how to run tests for the RESTHeart Cloud React starter.
tags: [testing, vitest, guidance]
verified:
  - by: openwiki/0.5.2
    at: 2026-09-16T09:23:22.035Z
sources:
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-a3fd7ec517783a7d5d8842d0
    resource: repo://src/consents-signal.ts
  - id: openwiki-source-440d3aa4e5dbdff8211c15e3
    resource: repo://src/just-signed-up.ts
  - id: openwiki-source-62327449da47479a80c27d31
    resource: repo://src/oauth-url.ts
generated: { by: "openwiki/0.5.2", at: "2026-09-16T09:23:22.035Z" }
---

# Testing Guidance

## Current Status

**No test files exist yet.** Vitest is configured as a dependency (`^2.0.0` in `devDependencies`) and the `npm test` script runs `vitest`, but there are no `.test.ts` or `.spec.ts` files in the repository.

## Vitest Setup

Vitest is already configured:

```json
// package.json
{
  "scripts": {
    "test": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

The Vite config (`vite.config.ts`) is minimal — Vitest uses it automatically. No additional Vitest config file is needed to start.

## Recommended Test Strategy

The recommended order is: **utilities first, then auth page component tests, then routing integration tests**. This builds confidence from the smallest, most isolated units outward.

### Unit Tests: Utilities

The simplest targets for initial tests:

| File | What to Test |
|------|-------------|
| `src/just-signed-up.ts` | `setJustSignedUp(true)` → `isJustSignedUp()` returns `true`; reset to `false` returns `false` |
| `src/oauth-url.ts` | `oauthUrl('google')` returns the correct URL pattern |
| `src/consents-signal.ts` | `isBlocked()` returns initial `false`; `setBlocked(true)` flips state and notifies subscribers; `setBlocked` with same value is a no-op; `subscribe` returns an unsubscribe function that removes the listener |

### Component Tests: Auth Pages

Auth pages have the most logic (form validation, error handling, loading states). Use Vitest + `@testing-library/react`:

| Component | Key Test Cases |
|-----------|---------------|
| `Login` | Renders email/password fields; shows validation errors on blur; handles 401 with specific message; calls `auth.login` on submit; shows OAuth buttons when `oauthLogin` is enabled |
| `Signup` | Form validation (first/last name, email, password min 8 chars); calls `auth.register()`; shows "Check your email" confirmation on success; handles 409 duplicate email; shows OAuth buttons when enabled |
| `Accept` | Missing params → error; new user flow → password form; existing user flow → login + accept; 404 → expired message |
| `ForgotPassword` | Submits email; shows success message |
| `ResetPassword` | Validates token from URL; submits new password |

### Integration Tests: Routing

Test that routes are correctly gated:

- Unauthenticated user visiting `/home` → redirected to `/auth/login`
- Authenticated user visiting `/auth/login` → redirected to `/`
- Feature flag `passwordReset: false` → `/auth/forgot-password` returns 404/catch-all

### What to Avoid

- Don't test `@restheart-cloud/kit-react` internals — the kit has its own tests
- Don't snapshot-test disposable skin CSS — the starter is designed to be reskinned

## Adding Tests

Create test files alongside source files using the `.test.ts` or `.test.tsx` convention:

```
src/
  just-signed-up.test.ts
  oauth-url.test.ts
  consents-signal.test.ts
  pages/
    auth/
      login/
        Login.test.tsx
```

Run tests:

```bash
npm test          # Watch mode (Vitest default)
npm test -- --run # Single run
```

## See Also

- [Architecture Overview](../architecture/overview.md) — understanding the component tree for test setup
- [Operations & Runbook](../operations/runbook.md) — build and dev workflow
