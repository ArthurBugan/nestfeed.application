# Tasks 005 — UI Refactor "Groupify 2027"

> Checkable items. Mark `[x]` as completed. Phase gates: FR-Q1..Q6 from spec.md.
>
> Implementation status (2026-10-17): all code phases implemented, all automated
> gates green. Device-only items (visualtap, Maestro runs, screenshots, contrast
> audit on hardware) remain and are logged in `review.md`.

## Phase 0 — Tokens
- [x] P0.1 Radius tokens in `global.css` (`--radius-control/card/tile/sheet` = 12/16/20/28; rounded-* 8/12/16 remain the built-in scale). Elevation as JS `theme/elevation.ts` (RN shadow objects), durations as JS `theme/motion.ts` — CSS vars not needed for JS-only consumers
- [x] P0.2 Inter wired via `--font-sans` + real weight faces (`--font-medium`/`--font-semibold`/`--font-bold` → Inter-Medium/SemiBold/Bold)
- [x] P0.3 Mirror new keys in `src/theme/themeColors.ts`; `separator` added
- [x] P0.4 Complete `groupify` emerald values (full key parity light/dark/groupify, test-enforced)
- [x] P0.5 `src/theme/alpha.ts` + unit tests (hsl/rgb/hex inputs, existing-alpha handling, clamps; silent-transparency guard)
- [x] P0.6 `src/theme/motion.ts` — springs/durations/easings/`timing()` + tests
- [x] P0.7 `src/theme/haptics.ts` — `tap/impact/notify` with unsupported-device guards + store-backed preference toggle
- [x] P0.8 Theme parity test (`theme.test.ts`): identical key sets across the 3 themes + `separator` + `groupify` variant regressions
- [x] P0.9 All 11 alpha-suffix sites replaced with `alpha()` (websites, billing, support×3, share-links×2, groups/[id]/share, share/[type]/[id], auth/oauth, forgot-password-success)
- [x] P0.10 `Uniwind.setTheme(variant)` supports `groupify`; Appearance offers System/Light/Dark/Groupify
- [x] P0.11 Gate: jest + tsc + export green

## Phase 1 — Primitives & bugfixes
- [x] P1.1 `Screen` wrapper (safe-area `edges`, scroll + pull-to-refresh, padding rhythm) — adopted across ~30 screens
- [x] P1.2 `ScreenHeader` (back/close, large/compact title, action slot) + tests — *collapsible-on-scroll hook deferred (see review.md)*
- [x] P1.3 `usePressAnimation` (Reanimated spring + reduceMotion + haptic) + tests
- [x] P1.4 `Button`/`IconButton`/`Chip` (variants, sizes, loading, haptics) + tests
- [x] P1.5 `Input` (label/error/password/slots; **forwarded ref** with `focus()/blur()` handle) + tests
- [x] P1.6 `SearchField` + tests
- [x] P1.7 `Card` (elevated/filled/outline) + tests
- [x] P1.8 `ListRow`/`ListGroup` (icon tiles w/ tint foregrounds, value/chevron/switch) + tests
- [x] P1.9 `SegmentedControl` + tests
- [x] P1.10 `Sheet` wrapper over `@expo/ui` (`onChange`/`index` props — the installed version has no `onIndexChange`) — used by settings delete-account flow; no dedicated test (covered indirectly by mocks)
- [x] P1.11 `Toast` (burnt wrapper; successes/infos; `Alert` reserved for destructive confirms)
- [x] P1.12 States polish: skeleton rows mirror final ListRow layout; `EmptyState` entrance animation
- [ ] P1.13 `expo install expo-blur expo-glass-effect` + fallback matrix — *deferred: blur/glass adds a native dep mid-stream; logged as follow-up in review.md*
- [x] P1.14 `insets` crash fixed in `groups/[id]/(tabs)/settings.tsx` (full rebuild on kit)
- [x] P1.15 Invalid icon colors fixed in `channels|animes/change-group/[id].tsx`
- [x] P1.16 `Icons.tsx` deleted (0 refs); dead `ListGroup` import removed
- [ ] P1.17 Gate: *visual* verification on device (light/dark/groupify) — requires simulator/hardware

## Phase 2 — Chrome
- [x] P2.1 NativeTabs kept (per decision D1); tab layouts de-hardcoded (colors via tokens, debug logs removed) — *JS fallback bar not built*
- [x] P2.2 Root `_layout`: `GestureHandlerRootView style={{flex:1}}`, `StatusBar` per theme
- [ ] P2.3 Collapsible large-title headers w/ blur — *deferred with P1.13*
- [x] P2.4 Unified back affordance (ScreenHeader: icon, 44pt, hitSlop, a11y label)
- [x] P2.5 Auth screens: brand hero, unified field system, brand social buttons working in both modes
- [x] P2.6 Dynamic Type: `maxFontSizeMultiplier` now only scales up (1.5 base, 2.0 large) — never caps OS scaling
- [ ] P2.7 Gate: chrome verified on device — pending hardware QA

## Phase 3 — Screens
- [x] P3.1 Dashboard bento grid, brand-true accents (token tints replace rose/blue gradients), quick-action chips, ErrorState
- [x] P3.2 Groups list: unified rows, tree indents kept, skeleton mirror, ad slots kept
- [x] P3.3 Channels list: same + 44×44 thumbnail leading (skeleton mirrors)
- [x] P3.4 Animes list: same + external-link affordance (a11y label added)
- [x] P3.5 Websites list: same; navigation preserved (`navigation.goBack()` on back)
- [x] P3.6 Group overview: ScreenHeader + share IconButton, cards, action rows
- [x] P3.7 Subgroups: kit rows + empty state
- [x] P3.8 Group settings: rebuilt on ListRow; delete via `Alert` confirm (routes unchanged)
- [x] P3.9 Add-channel: SegmentedControl with count badges (slot-aligned), kit SearchField/Input, sticky save bar
- [x] P3.10 Forms new/edit: field system + sticky submit bars + inline Zod errors (RHF `void handleSubmit(onSubmit)()` pattern kept)
- [x] P3.11 change-group ×2: ScreenHeader chrome, `border-accent` selection, accent check
- [x] P3.12 Settings hub: inset groups; no-op Notifications switch removed (no backing state)
- [x] P3.13 Account: saves via Toast; Avatar compound API (initials fallback) fixed
- [x] P3.14 Appearance: 4 theme options + font size + reduce motion + haptics rows
- [x] P3.15 Billing: plan cards; console.log removed; labeled Restore Purchases row
- [x] P3.16 Blog list: cards; fake `setTimeout` refresh → real `refetch()`
- [x] P3.17 Blog detail: reading typography; markdown theme map kept
- [x] P3.18 Groupshelf: sheet + cards; duplicate `contentContainerStyle` bug fixed
- [x] P3.19 Share-links / share/: unified rows, `alpha()` tints
- [x] P3.20 Support/terms/privacy: reading typography; dead FAQ link removed
- [x] P3.21 Maestro flow selectors verified unchanged ("Sign In", "Sign Up", "Forgot Password?", "Send Reset Link", "Back to Sign In" all still visible text)
- [ ] P3.22 Screenshots recaptured — *requires device/simulator pass alongside P1.17*

## Phase 4 — Polish & a11y
- [ ] P4.1 List enter choreography (stagger) — *entrance hook exists (`useEntranceAnimation`), list-level staggering deferred*
- [x] P4.2 Pull-to-refresh brand spinner (token-tinted via `Screen` RefreshControl)
- [ ] P4.3 Sheet open/close haptics — *tap()/impact available; explicit wiring deferred*
- [x] P4.4 Empty states via `EmptyState`/inline empty labels across lists
- [x] P4.5 a11y sweep: all pressables labeled (verified per-screen), ≥44pt targets (Chip h-11, buttons/rows/headers)
- [ ] P4.6 Contrast audit — *automated check not in scope; manual pass on device (see review.md)*
- [ ] P4.7 Dynamic Type 200% device pass — *code path fixed (P2.6); requires device*
- [x] P4.8 `DashboardHeader` deleted (0 refs after migration); `IconifyIcon` dead-token resolution fixed
- [ ] P4.9 Appshots graded background recapture — *asset generation, needs device run*

## Phase 5 — Verify & document
- [x] P5.1 tsc: **54 errors (baseline 82), zero new** in-touched files; temp `tsconfig.check.json` used (deleted after)
- [x] P5.2 Jest: **27 suites / 193 tests** (was 173) — new: ui-kit, states, alpha, motion, theme parity
- [x] P5.3 Export **iOS + Android** both green
- [x] P5.4 expo-doctor 17/18 (unchanged pre-existing CNG warning)
- [ ] P5.5 Maestro full suite green — *needs device; selectors verified textually (P3.21)*
- [x] P5.6 `review.md` written; follow-ups logged
