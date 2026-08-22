# Tasks 001: App Redesign (UI/UX)

> **Implementation Checklist**
> **Status:** APPROVED — scope confirmed 2026-08-21 (A + B + C + D + F; Track E deferred)

## Phase A: Theme Integrity (Track A) — *unblocks everything*
- [ ] **T-A1** Add `field-background` + `field-placeholder` to `themeColors.ts`
      (light **and** dark); verify all keys are defined.
- [ ] **T-A2** Fix hardcoded `getThemeColor('accent', false)` in
      `app/(app)/(tabs)/index.tsx` (home feed) and `RefreshControl` to use `isDark`.
- [ ] **T-A3** Replace `getThemeColor('field-background'/'field-placeholder', …)`
      call sites with theme-correct tokens in `Input.tsx`, `Select.tsx`.
- [ ] **T-A4** Audit all `placeholderTextColor={getThemeColor('field-placeholder', …)}`
      usages (channels, animes, groups, blog, websites, groupshelf) and confirm
      they resolve.
- [ ] **T-A5** Reconcile `colors.ts` vs `themeColors.ts` to one source of truth;
      remove/ deprecate duplicates; update imports.
- [ ] **T-A6** Unit tests: `themeColors` returns defined values for all keys,
      both modes.

## Phase C: Forms (Track C)
- [ ] **T-C1** `Input`: solid background, single focus ring, distinct labeled
      error state (no `undefined` colors).
- [ ] **T-C2** `Input`: accessible password show/hide toggle (hitSlop + label),
      correct `returnKeyType`, `autoFocus`, `onSubmitEditing`.
- [ ] **T-C3** `Select`: derive background/border from theme; keep search +
      bottom-sheet; accessible announced value.
- [ ] **T-C4** Verify login / register / forgot-password / settings forms render
      correctly in light + dark.
- [ ] **T-C5** RTL tests: focus, error, password toggle.

## Phase D: State Polish (Track D)
- [ ] **T-D1** `EmptyState` shared component (icon, title, CTA where applicable).
- [ ] **T-D2** `LoadingState` shared component (skeleton / spinner + a11y).
- [ ] **T-D3** `ErrorState` shared component with tappable "retry".
- [ ] **T-D4** Apply presets to list screens (feed, channels, groups, animes,
      blog) for their empty/error states.
- [ ] **T-D5** RefreshControl consistency + graceful loading across screens.

## Phase B: Consistency + Mild Visual Refresh (Track B)
- [ ] **T-B1** Document & apply radius scale (cards / inputs / selects / modals).
- [ ] **T-B2** Tokenize gradient shortcut-card text to contrast-safe tokens.
- [ ] **T-B3** Audit & harmonize spacing (`px-5`, vertical rhythm).
- [ ] **T-B4** Refine card elevation/shadow usage consistently (mild refresh, no rebrand).
- [ ] **T-B5** Subtle typography/spacing rhythm pass on key screens (home, more, group cards).

## Phase F: Accessibility (Track F)
- [ ] **T-F1** Persist `font-size` + `reduce-motion` in `appStore`.
- [ ] **T-F2** `ThemeProvider` wires system-color change + applies `reduce-motion`.
- [ ] **T-F3** Add `accessibilityLabel` to interactive elements (tab bar, menu
      rows, buttons, shortcut cards).
- [ ] **T-F4** Verify ≥44pt hit targets + Dynamic Size Text on touched screens.

## Phase E: i18n (Track E) — DEFERRED to follow-up spec 002 (not part of 001)
- [ ] ~~**T-E1** Add i18n library + `src/i18n/` scaffold (`en`, `pt`).~~
- [ ] ~~**T-E2** Extract strings from screens one-by-one; remove hardcoded English.~~
- [ ] ~~**T-E3** Language setting → functional + persisted; app re-renders on change.~~
- [ ] ~~**T-E4** Tests: default locale renders; one translated-screen test.~~

## Verification
- [ ] All FRs in scope met (per confirmed scope)
- [ ] NFR-A1: git diff shows no route / API / stored-data changes
- [ ] Lint + tests green
- [ ] Light + dark visual check on every touched screen
