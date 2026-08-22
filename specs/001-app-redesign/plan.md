# Plan 001: App Redesign (UI/UX)

> **Status:** APPROVED — scope confirmed 2026-08-21
> **Related spec:** `specs/001-app-redesign/spec.md`

## Architecture

Pure UI/UX + design-system work. No navigation routes, no API endpoints, no
stored-data schema changes (see `NFR-A1`). Changes are confined to
`src/theme/`, `src/components/`, `src/stores/`, and screen styling.

### Proposed File Changes
| Track | Layer | Path(s) | Action |
|---|---|---|---|
| A | Theme (single source) | `src/theme/themeColors.ts` | Add `field-*` tokens; reconcile palette; keep typed keys |
| A | Theme | `src/theme/colors.ts` | De-dup → route through `themeColors` (or deprecate) |
| A | Theme | `src/theme/ThemeProvider.tsx` | Wire system-change listener; persist display prefs |
| C | Component | `src/components/Input.tsx` | Canonical field: bg, focus, error, password toggle |
| C | Component | `src/components/Select.tsx` | Canonical select; bg from theme |
| D | Component | `src/components/EmptyState.tsx` | New shared presets |
| D | Component | `src/components/LoadingState.tsx` | New shared presets |
| D | Component | `src/components/ErrorState.tsx` | New shared presets |
| E (deferred) | i18n | `src/i18n/**` | Deferred to follow-up spec 002 |
| F | Store | `src/stores/appStore.ts` | Persist `font-size`, `reduce-motion` |
| B + — | Screens + styles | `src/app/**` | Apply themed colors, shared presets, a11y labels; mild visual refresh (radius/spacing/elevation) |

### Sequence (dependency order)
1. **Track A** (theme integrity) — unblocks everything; defines the tokens.
2. **Track C** (forms) — first visible wins; consumes the fixed tokens.
3. **Track D** (states) — shared presets consume A.
4. **Track B** (consistency + mild refresh) — polish + refine cards/spacing/elevation.
5. **Track F** (a11y) — audit + wire labels/hit-targets/motion.

Track E (i18n) is deferred to a separate follow-up spec (planned `002-…`).

### Design tokens (proposed, confirm)
- **Radius scale:** sm `6`, md `12`, lg `16`, xl `20`, `2xl` for cards — applied
  uniformly (replace ad-hoc `rounded-xl`/`rounded-2xl` mixing).
- **Spacing:** keep the existing Tailwind spacing scale (4/5/6/8 = 16/20/24/32px)
  as the baseline; audit for consistent horizontal padding (`px-5`).
- **Elevation:** reuse `colors.ts` `shadows.{sm,md,lg}` consistently (or move to
  `themeColors` as design tokens).
- **Contrast:** accent/foreground on background ≥ 4.5:1 for body text.

### Testing strategy
1. **Theme/token unit tests** (`src/__tests__/theme/…`): `getThemeColor` returns
   defined strings for all `field-*` keys in both modes; no `undefined`.
2. **Form component tests** (RTL): focus ring renders; error text shows; password
   toggle flips and is accessible; correct `returnKeyType`.
3. **State preset tests:** `EmptyState`/`ErrorState` render, "retry" fires.
4. **Manual/visual:** light + dark on a device or simulator for every touched
   screen; Dynamic Size Text; Reduce Motion.
5. **Regression:** `git diff` confined to UI/theme/a11y (no route/API/data).

### Dependencies
- HeroUI Native (`heroui-native`) components already available (Text, Avatar,
  Radio, Switch, Button, Separator).
- `expo-haptics` available for interaction feedback.
- i18n track (deferred) pre-approves `i18next` + `react-i18next` (see spec).

### Timeline
- **Estimate:** Track A + C + D + B(refresh) + F ≈ 3–5 days. Track E (i18n) deferred.
- **Phase:** UI/UX hardening + mild visual refresh for MVP.
