---
type: Guide
title: Testing Guidance
description: Vitest setup, recommended test strategy, and how to run tests for the RESTHeart Cloud React starter.
tags: [testing, vitest, guidance]
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

### Unit Tests: Utilities

The simplest targets for initial tests:

| File | What to Test |
|------|-------------|
| `src/just-signed-up.ts` | `setJustSignedUp(true)` → `isJustSignedUp()` returns `true`; reset to `false` returns `false` |
| `src/oauth-url.ts` | `oauthUrl('google')` returns the correct URL pattern |

### Component Tests: Auth Pages

Auth pages have the most logic (form validation, error handling, loading states). Use Vitest + `@testing-library/react`:

| Component | Key Test Cases |
|-----------|---------------|
| `Login` | Renders email/password fields; shows validation errors on blur; handles 401 with specific message; calls `auth.login` on submit; shows OAuth buttons when `oauthLogin` is enabled |
| `Signup` | Form validation; calls auth signup; redirects with `?flow=signup` |
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

<!-- openwiki: broken internal link [architecture/overview.md] file "architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Architecture Overview](architecture/overview.md) — understanding the component tree for test setup
<!-- openwiki: broken internal link [operations/runbook.md] file "operations/runbook.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Operations & Runbook](operations/runbook.md) — build and dev workflow
