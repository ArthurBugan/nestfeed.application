# Spec 001: App Redesign (UI/UX)

> **Status:** APPROVED — scope confirmed 2026-08-21 (see "Scope Confirmation")
> **Date:** 2026-08-21
> **Author:** <todo — Arthur / agent>
> **Related:** `specs/constitution.md` rules 1–11

---

## Problem Statement

Groupify's UI already ships on a consistent design system (HeroUI Native +
Tailwind `className`, a Zustand-driven `theme/`, custom `Input`/`Select`,
haptics, icons). However, the UX has grown inconsistently and has concrete,
reproducible defects that undermine the "better UI/UX" goal:

1. **Broken form theming (widespread).** `Input` and `Select` — and
   `placeholderTextColor` on ~7 screens (`channels`, `animes`, `groups`,
   `blog`, `websites`, `groupshelf`) — call
   `getThemeColor('field-background', …)` and `getThemeColor('field-placeholder', …)`.
   Neither key exists in `theme/themeColors.ts`, so these resolve to
   `undefined` at runtime. Inputs effectively have no background and no visible
   placeholder color, in both light and dark mode.
2. **Two parallel color systems.** `theme/colors.ts` (hardcoded hex, plus
   `statusColors`, `categoryColors`, `shadows`, `borderRadius`) and
   `theme/themeColors.ts` (HSL design tokens) coexist with no single source of
   truth. Tokens drift; new screens pick either system.
3. **Dark-mode bugs.** The home feed passes a hardcoded `false` to
   `getThemeColor('accent', false)` and `RefreshControl.tintColor`, so it renders
   the light-mode accent even on dark screens, ignoring `isDark`.
4. **Inconsistent visual tokens.** `rounded-2xl` and `rounded-xl` are mixed
   across cards, inputs and selects; gradient shortcut cards hardcode white text
   with opacity rather than themed contrast-safe tokens.
5. **No i18n despite the constitution.** `constitution.md` mandates
   "i18n-first," but there is no i18n library, all strings are hardcoded English,
   and the Settings → Appearance "Language" row is read-only ("English (US)").
6. **No standardized edge states.** List screens (feed, channels, groups, animes,
   blog) do not appear to share consistent loading / empty / error / offline
   treatments, and a11y is not consistently applied.

The goal of this spec is a controlled UI/UX improvement: fix the defects above,
harden the design system, and add missing UX foundations (i18n, edge states,
accessibility) — **not** a wholesale visual rebrand.

## Proposed Solution

Work in focused, independently-testable **tracks**. Scope confirmed 2026-08-21:
Tracks A, B (expanded to a mild visual refresh), C, D, F. Track E (i18n) is
deferred to a follow-up spec. Implementation order follows dependency risk:
tokens → components → screens → foundations.

- ✅ **Track A — Theme integrity.** Resolve to one source of truth; add the
  missing `field-*` tokens; fix every hardcoded dark-mode `false`.
- ✅ **Track B — Consistency + mild visual refresh.** Standardize corner radius,
  spacing, elevation; tokenize gradient cards; subtle card/typography rhythm pass.
- ✅ **Track C — Form component polish.** Rework `Input`/`Select` with guaranteed
  background, clear focus/error states, accessible password toggle, keyboard UX.
- ✅ **Track D — State polish.** Shared loading / empty / error / offline presets
  for list screens.
- ✅ **Track F — Accessibility.** `accessibilityLabel` on interactive elements,
  ≥44pt hit targets, Dynamic Size Text support, honor Reduce Motion.
- ⏸️ **Track E — i18n.** *Deferred to a follow-up spec (planned as `002-…`).*

## Requirements

### Functional Requirements

> Scope confirmed 2026-08-21: Tracks A, B (expanded), C, D, F. Track E (i18n) is
> deferred to a follow-up spec (see Scope Confirmation).

**Theme integrity (Track A)**
- **FR-A1:** Every input field renders a solid, correct background in both light
  and dark mode (no `undefined` colors).
- **FR-A2:** Input placeholder text is visible and theme-correct in both modes.
- **FR-A3:** Home feed and all screens use the correct accent/token for the
  *active* theme; no hardcoded `false` remains in `getThemeColor(…)` calls.
- **FR-A4:** `themeColors.ts` and `colors.ts` are reconciled to a single source
  of truth; unused tokens removed.

**Consistency (Track B)**
- **FR-B1:** A documented corner-radius scale is applied consistently to cards,
  inputs, selects and modals (no ad-hoc `rounded-*` mixing).
- **FR-B2:** Gradient shortcut cards use contrast-safe themed text, not
  hardcoded white-with-opacity.

**Forms (Track C)**
- **FR-C1:** `Input` exposes a single, clear focus ring and a distinct, labeled
  error state used by all forms.
- **FR-C2:** Password `Input` has an accessible show/hide toggle with haptics
  and correct `returnKeyType`/`autoFocus`/`onSubmitEditing` behavior.

**States (Track D)**
- **FR-D1:** Every list screen renders consistent loading, empty and error
  states (accessible, themed, tappable "retry" where applicable).

**i18n (Track E) — DEFERRED to follow-up spec 002**
- ~~**FR-E1:** All user-facing UI strings are externalized; no hardcoded English
  remains in `src/`.~~
- ~~**FR-E2:** Settings → Appearance "Language" actually switches UI language and
  persists the choice.~~

**Accessibility (Track F)**
- **FR-F1:** Interactive elements expose `accessibilityLabel` and meet the ≥44pt
  hit-target minimum.
- **FR-F2:** Body text scales with Dynamic Size Text without layout breakage.
- **FR-F3:** Animations respect the Reduce Motion setting in Appearance.

### Non-Functional Requirements
- **NFR-A1:** Zero change to navigation routes, API contracts, or stored data.
  This is a UI/UX spec only.
- **NFR-A2:** No new runtime dependencies unless approved (i18n track). If an i18n
  lib is added, it must be tree-shakeable and SSR/expo-compatible.
- **NFR-A3:** Touch Target & color-contrast ratios improve; no new WCAG-level
  regressions introduced.
- **NFR-A4:** All changes covered by tests / manual verification; lint + tests
  remain green.

## Design

### Design System Layer (`src/theme/`)
| File | Current issue | Target |
|---|---|---|
| `themeColors.ts` | Two systems; missing `field-*` keys | Single source of truth; add `field-background`, `field-placeholder`; expose typed keys |
| `colors.ts` | Duplicated palette + hardcoded hex | De-dup or deprecate; route theme colors through `themeColors` |
| `ThemeProvider.tsx` | System-change listener no-op; no saved `font-size`/`reduce-motion` | Wire up; persist display prefs |

### Components (`src/components/`)
- `Input.tsx`, `Select.tsx` — canonical field components (Track C). All forms
  consume these. Must derive colors from theme, never hardcode.
- New shared presets: `EmptyState`, `LoadingState`, `ErrorState` (Track D).

### State (`src/stores/`)
- `appStore` — persist `font-size`, `reduce-motion` (language persistence handled by the deferred i18n spec 002).

### Data flow
- No API changes. Color/state derives purely from theme + store; no server
  contract touched.

### i18n (Track E) — deferred to follow-up spec 002
- Pre-approved approach (decide when Track E starts): `i18next` + `react-i18next`
  (expo-compatible), `src/i18n/` with `en`, `pt` resources; `useTranslation` in
  screens; intercept hardcoded strings.

## Acceptance Criteria
- [ ] FR-A1 verified (light + dark)
- [ ] FR-A2 verified (light + dark)
- [ ] FR-A3 verified: `grep -rn "getThemeColor(.*false)"` in screens shows only
      intentional/justified hits (ideally zero)
- [ ] FR-A4: single palette source; `colors.ts` de-duped/removed
- [ ] FR-B1, FR-B2 verified visually
- [ ] FR-C1, FR-C2 verified in login/register/settings forms
- [ ] FR-D1 verified on every list screen
- [ ] FR-E1/FR-E2: deferred to follow-up spec 002 (i18n) — none applied here
- [ ] FR-F1, FR-F2, FR-F3 verified
- [ ] NFR-A1: routes/API/stored data unchanged (git diff shows only UI/theme/i18n/a11y)
- [ ] Lint + tests green

## Risks
- **R1:** (future, Track E) i18n extraction is broad — many screens, risk of
  missing a string or breaking localized layout. Sequenced as a separate follow-up spec.
- **R2:** Reconciling two color systems (Track A4) touches every screen that
  imports them; must be done carefully with tests/visual checks to avoid
  regressions.
- **R3:** "Make it better" is subjective — scope must stay locked to the tracks
  above to avoid silent scope creep (per `constitution.md` rule 2 / README rules).
- **R4:** Dynamic Size Text (FR-F2) can break existing layouts; need per-screen
  verification.

## Scope Confirmation

Confirmed 2026-08-21 by Product (Arthur) + implementer. **This spec is approved as-is.**

| Decision | Choice |
|---|---|
| Tracks in scope | **A + B (expanded) + C + D + F** |
| Visual scope | Fix + **mild visual refresh** (Track B refine: cards, spacing, elevation — no rebrand) |
| i18n (Track E) | **Deferred** to follow-up spec (planned as `002-…`) |
| i18n library (future) | `i18next` + `react-i18next` |
| Locales (future) | Open — decide when Track E starts (English only, or EN + PT first) |
| Numbering | 3-digit (`001-app-redesign`) |

Remaining open item
- **Locale decision (was Q4):** not needed for 001 (no i18n). Revisit when Track E starts.

