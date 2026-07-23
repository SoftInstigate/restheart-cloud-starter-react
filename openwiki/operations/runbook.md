---
type: Runbook
title: Operations & Runbook
description: Environment configuration, design system and styling, build and deploy workflow, theming, and feature flag management for the RESTHeart Cloud React starter.
tags: [operations, runbook, config, styling, build, deploy, theming]
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

Must be a valid `*.restheart.com` URL. The app validates this on startup with `isValidApiBaseUrl()` from the kit. If invalid, a [ConfigPage](source-map.md#entrypoint--app-shell) is shown instead of the app.

**After cloning**, tell git to ignore local changes:

```bash
git update-index --assume-unchanged src/environments/environment.ts
```

Then edit the file to point to your own service.

### Feature Flags

See [Auth & Teams — Feature Flags](domain/auth-and-teams.md#feature-flags) for the complete reference. These must match your RESTHeart Cloud service's toggles.

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

- [Architecture Overview](architecture/overview.md) — component tree and config gating
- [Auth & Teams](domain/auth-and-teams.md) — feature flag definitions
- [Testing Guidance](testing/guidance.md) — running tests
