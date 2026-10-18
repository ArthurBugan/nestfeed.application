# Plan 005 — UI Refactor "Groupify 2027"

> Companion to `spec.md`. Branch: `feat/ui-refactor-2027`. One mergeable commit per phase; FR-Q gates run at every phase boundary.

## Guiding constraints

- **Routes never change** (constitution rule 9). Touched files: `src/components/**`, `src/theme/**`, `global.css`, `metro.config.js` (unchanged), screen bodies, `_layout.tsx` chrome only.
- **Every phase ends green:** tsc ≤82 errors (no new), jest ≥173 green, bundle export, expo-doctor 17/18.
- **Public props stay compatible** where components are already consumed; new props are additive.
- **Maestro testIDs are contract** — preserved or updated in the same phase.

## Phase 0 — Design tokens (est. 2–3h, ~8 files)

1. `global.css`: add `--radius-*` (8/12/16/20/28), `--elevation-*` (3 shadow levels as CSS vars), `--duration-*` + spring tokens as static TS (motion lives in TS), `--text-*` scale wired to Inter (`font-display`/`font-sans` families via `@theme`).
2. `src/theme/themeColors.ts`: mirror all new keys; **add `separator`**; add complete `groupify` (emerald) values; keep the "solid colors only" rule.
3. New `src/theme/alpha.ts`: `alpha(color, amount)` → RN-valid `rgba()`/`hsla()` (parse `hsl(h s% l%)` tokens safely; unit-tested).
4. New `src/theme/motion.ts`: spring presets (`snappy` damping 18/stiffness 220, `gentle` 26/140), durations (120/200/320ms), easings; `reduceMotion` → duration 0 helpers.
5. New `src/theme/haptics.ts`: `tap()`, `impact()`, `success()` — all no-op when `reduceMotion`… (haptics are not motion: gate on a separate `hapticsEnabled`, default on; `reduceMotion` silences animation only).
6. Tests: token key parity CSS↔TS, `alpha()` edge cases, motion presets.
7. Fix FR-T2 call sites (11 files) → `alpha()`.
8. Wire `groupify` theme: `Uniwind.setTheme('groupify' | 'light' | 'dark')` from context; Appearance shows 3 options.

**Gate:** jest (new token tests), tsc, export. Visual: 3 themes side-by-side on dashboard.

## Phase 1 — Primitives + bugfixes (est. 4–6h, ~15 files)

1. `src/components/ui/` namespace: `Screen` (safe-area unification + `edges` prop), `ScreenHeader` (large-title collapse slot, back/close, action slot), `Button` (heroui + press-scale + haptics), `Input` (adopt custom impl; fix forwarded ref; heroui `TextArea` for multiline), `SearchField`, `Card`/`Surface` (elevation + continuous corners + optional glass), `ListRow`/`SettingsRow`, `SegmentedControl`, `Sheet` (expo-ui wrapper), `Toast` (one surface), `Pressable` base with `usePressAnimation`.
2. `usePressAnimation` (Reanimated): scale 0.97 spring on press-in, 1.0 on out; `reduceMotion` → opacity only.
3. Bugfix sweep (isolated commits): `insets` crash in `groups/[id]/(tabs)/settings.tsx`; invalid icon colors in change-group screens; dead `ListGroup` import; `Icons.tsx` deletion (0 refs).
4. `expo install expo-blur expo-glass-effect` (from SDK 58 manifest); glass fallback matrix documented.
5. Early device spike: `@expo/ui` sheet props on iOS/Android (risk table) — decides `Sheet` API.
6. Tests: `ScreenHeader`, `Button` (haptics fired, reduced-motion silence), `SettingsRow`, `usePressAnimation` with reanimated mock.

**Gate:** primitives rendered on a pilot screen (groups list) behind visual check.

## Phase 2 — Chrome (est. 3–4h, ~6 files)

1. `(app)/(tabs)/_layout.tsx`: keep `NativeTabs` (liquid glass on iOS 26); JS fallback bar with blur + animated active pill + tab-change haptic; icon/label tokens.
2. Root `_layout.tsx`: status-bar style management (`expo-status-bar` + `expo-system-ui`), `GestureHandlerRootView style={{flex:1}}`, `Host`/provider cleanup, remove redundant OAuth handlers.
3. Screen-level: headers collapse w/ scroll (Reanimated shared scroll Y or native `largeTitle` collapsible headers where available); back affordance unified.
4. Auth screens: brand hero + Inter display type; one field system; social buttons with correct brand tokens in both modes.
5. Fix Dynamic Type cap (`maxFontSizeMultiplier: 1` when small → honor OS: multiplier maps 1→1, medium→1.35, large→2, never below 1).

**Gate:** light/dark/groupify on all chrome; 44pt targets on tab bar; export.

## Phase 3 — Screens (est. 8–12h, ~30 files, split into 3 PRs)

**3a Lists & dashboard:** dashboard bento (P7, brand-true accents), unified rows for groups/channels/animes/websites/subgroups, tree guide lines, skeletons mirroring rows, `ListRow` adoption, ad slot styling.
**3b Group detail & forms:** segmented overview, cards, `Sheet` delete flow, sticky glass submit bars, legacy change-group screens brought to parity, Zod inline errors.
**3c Settings, blog, shelf, share, billing, legal, support, static:** inset grouped settings, working switches, reading typography for blog/legal, glass sheets.

Each PR: touches only its screens; preserves testIDs; updates affected maestro flows; recaptures screenshots for its screens.

## Phase 4 — Polish & a11y (est. 4–6h, app-wide)

1. List enter choreography, pull-to-refresh brand spinner, sheet morph transitions, empty-state teaches (P9) with actions.
2. a11y sweep: labels on the ~40 unlabeled pressables, ≥44pt everywhere, contrast audit (script + manual), Dynamic Type 200% pass.
3. Dead code removal follow-ups (proven unreferenced): `@gorhom/bottom-sheet`, `tailwind-variants` if unused, `colors.ts` hex beyond `shadows`, `DashboardHeader` unused props.
4. Appshots: brand palette frame gradient; recapture 7 existing screens + group detail + one form; regenerate framed assets.

## Phase 5 — Verify & document (est. 2–3h)

1. Full FR-Q gate: tsc baseline diff, jest w/ coverage thresholds, iOS+Android export, expo-doctor.
2. Maestro full run; screenshots recapture checklist complete.
3. Update `specs/005-ui-refactor-2027/review.md`; update `README`/`AGENTS` notes if any doc references old UI; note constitution stack-version drift (RN 0.86 line) as a separate follow-up.

## Rollback strategy

Per-phase commits; any phase failing gates is reverted independently. Token changes (Phase 0) are additive-first (new keys) so a revert doesn't strand consumers. `groupify` theme activation is feature-flagged by the Appearance selector (default stays `system`).

## Effort summary

| Phase | Focus | Est. |
|-------|-------|------|
| 0 | Tokens, alpha helper, motion, haptics, groupify theme | 2–3h |
| 1 | Primitives + bugfixes + blur spike | 4–6h |
| 2 | Chrome (tabs, headers, auth, status bar, Dynamic Type) | 3–4h |
| 3 | Screens (3 PRs) | 8–12h |
| 4 | Motion polish + a11y + assets | 4–6h |
| 5 | Verification + docs | 2–3h |
| | **Total** | **~23–34h** |
