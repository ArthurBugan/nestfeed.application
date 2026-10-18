# Spec 005 — UI Refactor "Groupify 2027"

> **Status:** Draft — awaiting approval
> **Refs:** specs/constitution.md (rules 1, 9, 10, 11), specs/001-app-redesign/ (tracks A–F, E deferred), specs/002-template/ (i18n, reserved)
> **Author:** UI refactor initiative
> **Supersedes:** none. Extends spec 001's design decisions (radius scale, 4pt spacing, token discipline).

---

## 1. Problem

The app is functionally rich but visually fragmented. Measured inventory (46 route files, ~40 screens):

1. **Two color systems coexist.** `src/theme/themeColors.ts` (HSL, source of truth) + `src/theme/colors.ts` (deprecated hex, still imported by 8 screens for `shadows`). CSS tokens in `global.css` are the third representation. `separator` is used at runtime but missing from `themeColors` → renders `undefined`. The `groupify` (emerald) theme exists in CSS + metro config + generated types but `Uniwind.setTheme` never selects it → orphan brand identity.
2. **Broken colors shipped.** 11 sites do `` backgroundColor: `${getThemeColor('accent', isDark)}15` `` — `hsl(158 72% 38%)15` is invalid for RN's color parser → silent transparency. `colors.ts` header says "Solid colors — never alpha"; the code disagrees.
3. **Chrome duplicated ~30×.** Back-button header (`w-10 h-10 rounded-full` + icon + hitSlop) copy-pasted across ~22 screens with drift (hitSlop 4/8/10, `lucide:x` vs `arrow-left`, three different safe-area patterns: `SafeAreaView` (16 files), `insets.top` (18), neither (10)).
4. **Settings-row pattern duplicated ~20×**; sign-out duplicated 3×; two competing `Input` implementations (10 screens raw heroui vs 5 custom); three search-field treatments.
5. **Zero motion design.** `react-native-reanimated` 4.7 + `worklets` 0.13 are installed and jest-mocked but **never imported in `src/`**. The only interaction feedback is `activeOpacity={0.7}`. Haptics: 103 call sites, all `selectionAsync()`, all inline, none gated by `reduceMotion`.
6. **Dead weight.** `Icons.tsx` (0 imports), `heroui-native` `ListGroup` (imported, never rendered), `@gorhom/bottom-sheet` (0 imports), Inter fonts (registered, never referenced), `DashboardHeader.subtitle/description` (never passed), `colors.gradient` red/pink.
7. **Off-brand visuals.** Dashboard shortcut tiles use `from-rose-400/80 to-pink-500/80` gradients unrelated to the green brand; appshots frame gradient is purple `#667eea→#764ba2`.
8. **Runtime bugs.** `groups/[id]/(tabs)/settings.tsx` references `insets` without importing it → crash on mount. Invalid icon colors (`color="color-primary"`, `color="primary"`) in 2 screens. `Input` drops forwarded `ref` (dead focus chaining in login).
9. **A11y gaps.** `maxFontSizeMultiplier` is *lowered to 1* when `fontSize==='small'` (caps instead of respects OS setting); ~40 pressables have no label; several rows <44pt.
10. **Stale capture assets.** Only 7/40 screens have screenshots; framed iOS assets predate spec 001; `maestro/` (30 flows) encodes current testIDs — any refactor must preserve them or update flows deliberately.

**Result:** the app looks like three different apps stitched together, and the constitution's rule 11 (accessibility "de série") and rule 10 (i18n) are only partially satisfied.

---

## 2. North Star — "2027 Design Principles"

Eleven principles, ordered by impact. Every task in §4 traces to one.

| # | Principle | Meaning for this app |
|---|-----------|----------------------|
| **P1** | **Spatial depth over borders** | Surfaces are separated by translucent layers + soft elevation, not 1px borders. Borders reserved for fields and focus rings. |
| **P2** | **Continuous corners** | Squircle radius scale (`borderCurve: 'continuous'` on iOS): 8/12/16/20/28 px roles, never mixed arbitrarily. |
| **P3** | **Liquid-glass chrome** | Translucent, blurred bars/sheets (iOS 26 Liquid Glass idiom via `expo-blur` + `expo-glass-effect`); opaque + solid fallback for Reduce Transparency and low-end Android. |
| **P4** | **Motion as language** | Spring-based, interruptible, purposeful motion: press response, shared layout, list choreography, sheet morph. `reduceMotion` silences all of it, globally. |
| **P5** | **Tactile feedback** | Every control answers the finger: scale/opacity + light impact haptic, via one shared helper. |
| **P6** | **Typography-first hierarchy** | One family (Inter — already registered, never used). Hierarchy from size/weight/color; display sizes for heroes; no decorative text. |
| **P7** | **Bento modularity** | Content in consistent modules on a 4pt grid with generous whitespace; dashboard becomes a bento grid, not 6 gradient cards. |
| **P8** | **Color with intent** | One brand accent + semantic statuses only; perceptually even light/dark; the `groupify` emerald theme completed as the identity theme (`getThemeColor` and CSS agree). |
| **P9** | **Content continuity** | Skeletons mirror final layout; optimistic actions; empty states that teach and offer the next step. |
| **P10** | **Accessible by construction** | ≥44pt targets, labels on every pressable, Dynamic Type respected (never capped), contrast ≥4.5:1 text / 3:1 UI. |
| **P11** | **Performance budget** | Interactions at display refresh (60/120fps); blur/elevation measured on mid-tier Android; no main-thread work in gestures. |

**Explicitly NOT 2027 (anti-goals):** heavy gradients everywhere, neon glows, glassmorphism-for-decoration, parallax overload, new navigation paradigms, dark patterns.

---

## 3. Scope

### In scope
- Design-token architecture (CSS-first + TS mirror), motion tokens, elevation, radius, type scale.
- New/consolidated primitives in `src/components/` (`Screen`, `ScreenHeader`, `Button`, `Input`/`SearchField`, `Card`/`Surface`, `ListRow`/`SettingsRow`, `SegmentedControl`, `Sheet`, `Toast`, states).
- Migrate all ~40 screens to primitives; delete duplicated chrome; fix the runtime bugs in §1 (insets crash, separator, alpha colors, invalid icon colors, dropped ref).
- Motion system via Reanimated (press, list, header, refresh) + haptics helper.
- Chrome restyle: tab bar, headers, auth hero, dashboard bento, list rows, forms, settings, blog reading view.
- a11y pass; `groupify` theme completion; dark/light parity for native props.
- Refresh capture assets (appshots) for changed screens; maestro testIDs preserved or flows updated in the same PR.
- New deps allowed only from the SDK 58 manifest: `expo-blur`, `expo-glass-effect` (keep `expo install --fix` green).

### Out of scope (hard boundaries)
- **Navigation flow stays identical** — same routes, same stacks, same tabs (constitution rule 9). This is a restyle, not a re-architecture.
- i18n (spec 002, pre-approved approach reserved) — refactor keeps existing strings; no new hardcoded English beyond what already exists.
- State/data layer (Zustand, React Query), API client, native project structure.
- Removing dead deps (`@gorhom/bottom-sheet`, `Icons.tsx`, `tailwind-variants`, `colors.ts` hex palette beyond `shadows`) — logged as follow-ups, removed only when proven unreferenced by tests.
- Monetization surface (AdMob placement) — keep positions/types, restyle wrappers only.

### Open decisions (recommend defaults)
- **D1 — Tab bar:** keep `NativeTabs` (iOS 26 renders it as liquid glass automatically) + restyled Android/web via `IconifyIcon` src; add active-indicator motion on JS fallback. *(Recommended — zero flow change, native fidelity.)*
- **D2 — `groupify` theme:** complete it (emerald values in `themeColors.ts`, selectable in Appearance as "Groupify" brand theme). *(Recommended — it already exists everywhere else.)*
- **D3 — Motion intensity:** full springs by default; `reduceMotion` toggle in Appearance silences everything. *(Recommended.)*

---

## 4. Functional Requirements

**Tokens (FR-T)**
- **FR-T1** `global.css` is the single source of truth; `themeColors.ts` mirrors it 1:1 (same keys). Add a parity test that fails if keys drift.
- **FR-T2** Fix `separator` (add to `themeColors` + both CSS themes) and remove all alpha-suffix hacks via a typed `alpha(color, amount)` helper that outputs RN-valid `rgba()`/`hsla()` strings (11 call sites).
- **FR-T3** Tokens: radius scale (`--radius-*`), elevation (`--elevation-*` shadow strings), motion (`--duration-*`, spring presets exported from `src/theme/motion.ts`), type scale (`--text-*` mapped to Inter weights).
- **FR-T4** `groupify` theme: emerald palette added to `themeColors.light`/`dark` parity + `Uniwind.setTheme` wiring; selectable in Appearance; every native prop consumer verified in all three themes.

**Primitives (FR-P)**
- **FR-P1** `Screen` — unified safe-area wrapper (kills the 3 competing patterns; fixes the missing-insets crash class), scroll/edge-to-edge props, background token.
- **FR-P2** `ScreenHeader` — one implementation: configurable back/close icon, large-title collapse-on-scroll, action slot. Replaces all ~22 header copies; preserves existing a11y labels.
- **FR-P3** `Button` — wraps heroui `Button` + press-scale (Reanimated) + haptics + loading; variants primary/flat/outline/danger/ghost; kills the raw `TouchableOpacity bg-accent` CTAs.
- **FR-P4** `Input`/`SearchField` — one field system over heroui `Input` (label, error, password toggle, left/right slots, multiline via heroui `TextArea`); fixes dropped `ref`; one search treatment.
- **FR-P5** `Card`/`Surface` — elevation + continuous corners + optional glass; replaces inline `rounded-2xl + shadows.md` blocks.
- **FR-P6** `ListRow`/`SettingsRow` — icon tile + title + subtitle + value/chevron + `onPress`; replaces the ~20 settings-row copies and list-row drift.
- **FR-P7** `SegmentedControl` — over heroui `Tabs`/`RadioGroup`; used by group-detail tabs, add-channel tabs, appearance font-size, blog filters.
- **FR-P8** `Sheet` — one wrapper over `@expo/ui` BottomSheet (snap points, glass background, handle, reduce-motion aware); adopts `Select`, `IconPicker`, groupshelf, delete-account.
- **FR-P9** `Toast` — one notification surface (heroui toast or burnt) replacing screen-level `Alert.alert` for success/info; `Alert` reserved for destructive confirms.
- **FR-P10** States — `LoadingState` (skeleton mirrors layout), `EmptyState` (teach + action), `ErrorState` (retry) adopted by every screen currently using raw `ActivityIndicator`/hand-rolled empty states.

**Screens (FR-S)**
- **FR-S1** Auth (login/register/forgot/reset/oauth): brand hero, Inter typography, one field system, brand-correct social buttons with dark-mode variants, full a11y labels.
- **FR-S2** Dashboard: bento grid modules (P7) using brand-true accents; quick actions as chips; no off-palette gradients.
- **FR-S3** Lists (groups/channels/animes/websites/subgroups): unified row (P1/P5), tree indentation with guide lines, skeletons mirroring rows, consistent ad slots.
- **FR-S4** Group detail: segmented overview, cards for description/actions, settings screen rebuilt on `SettingsRow` (crash fixed), delete flow via `Sheet` + confirm.
- **FR-S5** Forms (new/edit group/channel/anime, change-group): one field system, sticky glass submit bar, inline Zod errors, legacy screens brought to parity.
- **FR-S6** Settings: inset grouped lists, `Sheet`-based delete account, working switches (remove hardcoded `isSelected`), dead rows removed or wired.
- **FR-S7** Blog/shelf/share/support/legal/billing: reading typography, consistent headers, glass sheets on shelf.

**Chrome & motion (FR-C / FR-M)**
- **FR-C1** Tab bar: D1 default — `NativeTabs` + liquid glass on iOS 26; JS fallback bar with blur + animated active pill + haptic on tab change.
- **FR-C2** Headers collapse on scroll with blur; back affordance consistent (P2/P3).
- **FR-M1** Motion system in `src/theme/motion.ts` (springs: snappy/gentle; durations; easings) + `usePressAnimation` hook (scale 0.97 + haptic) applied to all pressables.
- **FR-M2** List choreography (enter stagger on tabs), sheet morph, pull-to-refresh with brand spinner; all gated by `reduceMotion`.
- **FR-M3** Route transitions unchanged (constitution rule 9) — no custom stack animations.

**Quality gates (FR-Q)**
- **FR-Q1** `npx tsc --noEmit` (relaxed config): error count ≤ 82 baseline, **zero new errors**; fixes made during refactor must not regress.
- **FR-Q2** Jest: ≥173 existing tests green + new tests: token parity, `alpha()` helper, motion hook (reanimated mock), `ScreenHeader`, `Button` haptics, `SettingsRow`. Coverage thresholds (50%) still met.
- **FR-Q3** `npx expo export --platform ios` (and android) succeeds.
- **FR-Q4** `npx expo-doctor`: 17/18 (only pre-existing CNG warning).
- **FR-Q5** a11y: every pressable has label + ≥44pt (script-verified); Dynamic Type at 200% no clipping on key screens.
- **FR-Q6** Maestro: testIDs preserved; flows updated only where the UI structure intentionally changed; `screenshots/` recaptured for changed screens.

---

## 5. Acceptance Criteria

1. One header pattern, one settings-row pattern, one field system, one search field — greps for the old inline patterns return zero.
2. Zero runtime `undefined` colors (alpha bug class eliminated; `separator` resolved); zero missing-safe-area screens.
3. All 11 alpha sites use the typed helper; light/dark/groupify verified on primary screens.
4. Reanimated in use: press feedback on all primary controls; `reduceMotion` toggle disables all animation app-wide.
5. Haptics via shared helper (selection + impact), never inline `Haptics.*` calls in screens.
6. FR-Q gates green; maestro suite green; screenshots refreshed for changed screens (7 existing + group detail/forms).
7. Navigation flow byte-identical (`git diff` shows no route file additions/removals; only `_layout.tsx` chrome changes).

## 6. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Constitution rule 1/9 gate | This spec is the approval artifact; keep flow unchanged; layout-only diffs in `_layout`s |
| Maestro flows encode old DOM | Preserve testIDs; update flows in same change; run suite before merge |
| Blur perf on low-end Android | Opaque fallback when `Reduce Transparency` on or `Platform.Android` perf flag; elevation instead of blur |
| `@expo/ui` BottomSheet props are no-ops on native | Verify each sheet on device early (Phase 1 spike) |
| heroui-native 1.x API drift | Pin primitives to a thin internal API; lib changes isolated to `src/components/ui/*` |
| Large diff / regression surface | Phase-by-phase mergeable PRs; each phase green on FR-Q gates |
| Inter font never wired | Wire via CSS `--font-*` tokens first (safe), verify glyphs on device |
| Screenshot assets stale | Recapture after Phase 3; appshots gradient updated to brand palette |

## 7. Sequencing

Phase 0 tokens → Phase 1 primitives+bugfixes → Phase 2 chrome → Phase 3 screens → Phase 4 polish/a11y → Phase 5 verify/assets. Each phase is independently shippable behind the same branch; details in `plan.md`, checkable items in `tasks.md`.
