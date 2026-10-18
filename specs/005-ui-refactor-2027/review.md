# Review 005 — UI Refactor "Groupify 2027"

> Implementation complete (uncommitted work, branch `feat/init-app`).
> Scope: 67 files (56 modified + new kit/theme/test files), no route or behavior changes.

## What shipped

### Foundations
- **Theme engine**: 3 full-parity palettes (light / dark / **groupify** brand emerald),
  `separator` + `on-gradient` tokens, `alpha()` compositing helper replacing the 11
  invalid hex-suffix concatenation sites (which materially rendered transparent),
  motion tokens (springs/durations/easings, reduce-motion aware), haptics module with
  unsupported-device guards and a persisted user preference (independent of reduce-motion).
- **UI kit** (`src/components/ui/`): `Screen` (safe-area/scroll/refresh), `ScreenHeader`,
  `Button`/`IconButton`/`Chip` (44pt targets, spring press + haptic), `Card`,
  `ListRow`/`ListGroup` (tinted icon tiles with contrast-safe foregrounds),
  `SearchField`, `SegmentedControl`, `Sheet` (`@expo/ui`), `Toast` (burnt),
  `PressableScale`, entrance-animation hook.
- **One field system**: unified `Input` with forwardRef handle (`focus()`/`blur()`),
  password toggle, slots; `SearchField` for the one search treatment.

### Screens (all 44 routes)
Bento dashboard: **neutral cards** (`bg-surface` + hairline `border-border`,
standard `rounded-3xl` 24px corners) with the per-card color expressed in the
**icon chip** — soft tinted circle + saturated tinted icon (`--*-soft` chip +
`teal`/`lime`/`accent`/`success`/`warning`/`danger` icon; rose reuses `danger`;
pairs defined in all three palettes; 2026-10-17 requests: distinct colors →
palette bg disliked → color moved into chips). Discovered: named radius token
classes (`rounded-tile`/`rounded-card`) silently resolve to ~0 at runtime —
the scale exists as `:root` vars but uniwind never picks them up, so tiles
were rendering near-square all along; dashboard now uses the standard
`rounded-3xl`. Every other `rounded-tile`/`rounded-card` usage needs the same
treatment (logged in deferred follow-ups), unified
list screens, sticky-bar forms with inline Zod errors, SegmentedControl tab switchers in
add-channel (count-badge overlay fixed to stay slot-aligned), Sheet-based destructive
flows, brand-hero auth screens with focus chaining, reading typography for blog/legal.

### Bugs fixed along the way
- `insets` crash in group settings (called before insertion)
- Invalid icon colors (`color="color-primary"` / `"primary"` literal strings) in change-group screens
- `IconifyIcon` resolved camelCase token names → nonexistent CSS vars (e.g. `--color-accentForeground`);
  icons also silently fell back to library default — both fixed
- `Avatar name` prop dropped by heroui types (empty avatar circles) — compound API with initials fallback
- heroui `Switch` fed RN props (`value`/`onValueChange`) → dead Group Shelf toggle in `groups/new.tsx`
- groupshelf duplicate `contentContainerStyle` (last-wins silently)
- fake `setTimeout(...,1000)` blog refresh → real `refetch()`
- no-op Notifications switch (removed; no backing state), dead `/support/faq` link (route never existed)
- FlashList v2 `estimatedItemSize` type error, heroui `fullWidth` misuse, `Skeleton` width/height props
- debug `console.log`s in chrome/layout files (kept functional AdMob lifecycle logs)

## Verification (FR-Q gates)

| Gate | Result |
|---|---|
| Jest | 27 suites / 193 tests passing (baseline 173; +20 new) |
| tsc (temp check config) | 54 errors, down from 82 baseline; **zero new** in touched files |
| iOS export | green (Hermes bundle built) |
| Android export | green (Hermes bundle built) |
| expo-doctor | 17/18 — unchanged pre-existing CNG warning |
| Maestro selectors | textually verified unchanged; full run needs device |
| CSS ↔ TS parity | 34 `--color-*` vars identical across 3 theme blocks; TS keys test-enforced |

## Deferred / follow-ups (device-dependent or out of scope)
1. **Device visual QA** (P1.17/P2.7/P3.22): light/dark/groupify, 200% Dynamic Type,
   contrast audit (P4.6), screenshots + Appshots recapture (P3.22/P4.9).
2. **Maestro full run** (P5.5) on simulator/device — selectors verified textually only.
3. **Blur/glass chrome** (P1.13/P2.3): collapsible large headers pending `expo-blur`
   install (native dep deliberately postponed mid-stream).
4. **List stagger choreography** (P4.1) — `useEntranceAnimation` exists; wiring into
   FlashList item entrances deliberately left for a device-tuned pass.
5. **Sheet open/close haptics** (P4.3) — wiring one-liner when device testing resumes.
6. **Dependency cleanup** (P4.8 remainder): `@gorhom/bottom-sheet`, unused tailwind libs,
   legacy exports in `theme/colors.ts` — all low-risk removals after a clean device pass.
7. **Pre-existing tsc remainder (54)**: data-layer typings (`channels.change-group` ×12 —
   `Channel.data` shape from API), zod-resolver variance in `groups/new|edit` (behavior
   correct), stale hooks tests referencing removed API surface, `blog/[slug]` heroui
   markdown typings, test-infra implicit-lets. None are UI-refactor regressions.
8. **Repo hygiene carried over**: stale git remote URL (redirect works), `expo-dev-client`
   gap, i18n (reserved spec 002), `screenshots/text-overlay.tsx` importing nonexistent
   remotion APIs, constitution's stale stack line (RN 0.86/Expo 57 → now RN 0.88-rc.4/SDK 58).

## Post-refactor stack alignment (2026-10-17)
Expo SDK 58 matured stable after the initial beta/RC upgrade; project moved to
`expo ~58.0.14` + `react-native 0.88.0` (stable). Companion libs re-aligned via
`expo install --fix` (reanimated 4.7.1, gesture-handler 3.3.0, screens 4.30.0,
worklets 0.13.0, svg 15.16.0); jest bumped to v30 (suite untouched, 193/193);
native `ios/`+`android/` regenerated via `expo prebuild --clean`. All gates
re-verified green (doctor 17/18, tsc 54, iOS+Android exports). **Pin decision**:
`react-native-google-mobile-ads` stays at 16.3.3 — generated Android still compiles
with Kotlin 2.2.0 (now from `@react-native/gradle-plugin`, AGP 9.2.1), and ≥16.4
releases ship Kotlin 2.3 metadata; revisit the bump together with the Kotlin
upgrade, not independently.

## Constitution compliance
- Spec-before-code: spec.md/plan.md/tasks.md written and tracked before implementation.
- No navigation-flow changes: every route, push/replace target, and back affordance preserved.
- i18n: deferred to reserved spec 002 (strings untouched).
- A11y: ≥44pt enforced in kit; labels swept across all screens.

## White-screen post-mortem: uniwind Metro alias vs. SDK 58 (2026-10-17)
After the stable bump the app booted to a blank white screen with zero logged
errors — no crash, no Redbox, no outbound traffic. Root cause chain:

1. React Native 0.88 **removed the standalone `@react-native/assets-registry`
   package**; asset registration moved into RN core, and `expo-asset` 58.x now
   imports `{ AssetRegistry } from 'react-native'`.
2. uniwind's Metro plugin (`withUniwindConfig`) aliases **every bare
   `react-native` request — from any importer** — to its capped shim
   `uniwind/src/components/index.ts`, which forward-lists themed components only.
   Third-party libs therefore see a `{}`-shaped module: `AssetRegistry` resolves
   to `undefined` → `cannot read property 'getAssetByID' of undefined`.
3. The first casualty is `useFonts` (`expo-font` → `expo-asset`),
   which swallows the rejection into an eternally-false `fontsLoaded` (the hook
   does not rethrow). `RootLayout`'s `if (!fontsLoaded) return null` then
   renders nothing, and the broken launch splash (missing nib image) shows
   as plain white. Any other library importing
   non-component RN exports (`AssetRegistry`, `StatusBar` internals, …) would
   break the same silent way.

**Fix** (`metro.config.js`): a resolver pre-pass that exempts third-party
node_modules importers (excluding uniwind-internal and react-native-internal
origins) from the `'react-native'` alias, so they resolve the real package;
app code (`src/`) keeps uniwind's themed components. Plus resilience tweaks:
`useFonts` error now surfaces via `console.warn('[fonts] failed to load:', …)`.

Diagnosis lesson: the failure produced **no crash and no log**; it was found
by bisection (hardcoded red probe → font-gate red/orange → on-screen error text
`FONT ERROR: Cannot read property 'getAssetByID' of undefined` → bundle
dependency-map trace showing `require("react-native")` inside expo-asset
resolving to `uniwind/src/components/index.ts`). Next SDK jump checklist item:
after companion bumps, boot the DEBUG build to first paint **before** regenerating
native projects; if a library imports from bare `'react-native'`, verify it
against any import-intercepting Metro plugin.

### Two more root causes surfaced after the release fix (same day)

**4. uniwind 1.12.2 runtime crash: `Object.assign` vs. getter-only base vars.**
With the resolver fixed, the release build rendered — but the dev build still
crashed at `global.css` module eval: `Cannot assign to property '--background'
which has only a getter`. Reproduced in node with the exact bundle modules:

- uniwind's *regenerated* `node_modules/uniwind/uniwind.css` (rewritten on every
  Metro transform from our themes) declares `@theme { --background: unset; … }`
  defaults. The compiled CSS module emits the base `vars` object with these as
  **lazy getter-only accessors** (`get "--background"() { return "unset" }`).
- `UniwindStore.reinit` then builds per-theme clones via
  `Object.create(baseVars)` + `Object.assign(clone, themeVars)`.
  `Object.assign` always performs **strict-mode assignment**, and assigning a
  key whose *inherited* property is an accessor-without-setter **throws**.
  Every theme overriding `--background` (heroui-native setups always do) hits
  it, first `--background`, deterministically, in dev.

**Fix:** `scripts/patch-uniwind.js` (wired to `postinstall`, idempotent, fails
loudly if the package shape changes) patches
`uniwind/src/core/native/store.ts` to copy property **descriptors**
(`mergeVarDescriptors`) instead of `Object.assign` in both `reinit` and the
`resolveStyles` scoped-vars overlay. Getter laziness, prototype fallback and
theme semantics are unchanged. Ecosystem note worth checking upstream: any
uniwind + heroui-native project on 1.12.2 likely hits this in dev.

**5. Stale Metro process masked the dev fix.** `expo run:ios` reuses whatever
listens on :8081 — ours was a Metro started at **14:37, before the uniwind bump
and the resolver fix** — so dev bundles kept resolving with the pre-fix config
even after everything was corrected, while Release (which bundles fresh during
the Xcode build phase) was fine. Killing the old process and starting a current
`expo start` flipped dev instantly. Rule: after touching `metro.config.js`,
kill the packager (`lsof -nP -iTCP:8081 -sTCP:LISTEN` → kill) before judging
dev results; `expo start --clear` at *server start* is not enough later.

Final residuals from the boot saga, all intentional keeps:
- `_layout.tsx`: `fontError` is now logged via `console.warn('[fonts] …')` so a
  font failure can never again be a silent white screen.
- `metro.config.js`: Sentry stale-request shim moved above the uniwind wrapper;
  `react-native`-alias exemption is an allowlist (`realRnPackages`; expo-asset
  only) so heroui-native keeps uniwind's styled components.
- `scripts/patch-uniwind.js` + `postinstall` in package.json.
- uniwind pinned/bumped to 1.12.2 (RN ≥0.87 color-scheme compat).

## Post-mortem addendum: the resolver bypass broke heroui styling (same day)

**6. The broad "real react-native for all node_modules" exemption was itself a
regression.** With it in place every heroui-native component (buttons, fields,
text fields — the whole library) resolved bare `'react-native'` to the real RN
package, i.e. **raw, uniwind-unaware components** — and uniwind is the layer
that processes `className` on RN primitives. `bg-primary` on our kit wrappers
(unwind-routing app code) still worked, which masked it, while every
className-driven `heroui-native` internal style silently died. Visible
symptom: all form inputs rendered as bare floating labels with no box, height,
border or padding.

**7. `@import 'heroui-native/styles'` is silently dropped by uniwind's Tailwind
pipeline.** uniwind hands the CSS entry to `@tailwindcss/node`; the heroui
package's `exports` map entry for the `'./styles'` subpath is not resolved
there (resolution failure → import skipped, no error). Result: the compiled
runtime stylesheet never contained any heroui component class
(`.input__input`, `.field__root`, …), even though tailwind's intermediate
output proved the variables made it. **Fix:** import by relative path instead:
`@import './node_modules/heroui-native/lib/module/styles/index.css';` —
after which the compiled stylesheet contains the full heroui class set
(verified: `.input__input` with `minHeight: --spacing*12`, padding, border).

**8. Correct final resolver shape (allowlist, not broad bypass).** The
exemption from uniwind's alias is restored for *everyone* (heroui needs it),
except an explicit allowlist of libraries that break under the alias because
they import RN exports the shim does not provide — currently only
`expo-asset` (`AssetRegistry` after RN 0.88 removed
`@react-native/assets-registry`). New offenders go into `realRnPackages` in
`metro.config.js` as they are discovered.

9. **Design tokens now make fields match spec 005 P1** ("Borders reserved for
fields and focus rings"): heroui ships `--field-border-width: 0px` and a
21px field radius (`--radius * 1.75`); `global.css` overrides both at token
level — `--field-border-width: 1px`, `--field-radius: var(--radius-control)`
(12px) — with per-variant border colors already themed (`--field-border`).
This affects every screen using the `Input` kit, not just login.

Diagnosis lesson #2: "which styles died" ≠ "which styles die in CSS". Two
independent layers can each disconnect the same selector: (a) the importer
must ride uniwind's alias, (b) the custom class must exist in the compiled
stylesheet. Verify both ends separately (compiled `__reinit` stylesheet in
the bundle for (b), runtime `className` processing for (a)) instead of
assuming either is fine.

Also worth remembering: in dev, expo serves the full 3678-module graph even
under `lazy=true`; grepping a bundle *fetched the way the app fetches it*
(`/.expo/.virtual-metro-entry.bundle?...lazy=true...`) is the truthful check,
not arbitrary hand-built URLs.

## Post-mortem addendum: blank tab screens (Home / More / Settings)

**10. `Screen`'s `SafeAreaView` root rendered nothing when mounted directly
inside the native tab content host.** Symptom: every screen whose root was the
`Screen` kit (home, More, `/settings`, and by extension any Screen-based
route) showed an empty background — the JS rendered fine (component bodies,
queries, console logs all executed) while the native view subtree never
painted. Screens rooted in plain `View`s (Groups, Channels) painted normally,
and login — which predates the kit — was fine. The kit's
`SafeAreaView` (react-native-safe-area-context) as the *direct child of the
NativeTabs content host* collapses to an unpainted (zero-height) subtree;
wrapping or rooting in a plain `View` heals it. **Fix:** `Screen` now roots in
a plain `View` with explicit `flex: 1` + per-edge resolved inset padding
(`useSafeAreaInsets`) — same quoting/edges API, no native SafeAreaView in the
hot path. Also fixed while here: home passed `edges={[]}` so its title sat
behind the status bar (invisible while the bug hid everything) — now
`edges={['top']}` like every other Screen-based screen; and the groups /
channels / animes stacks declared `Stack.Screen name="index"` for routes that
no longer exist post-refactor (cosmetic LogBox warning spam) — stale
declarations removed.

**Safe-area audit follow-up (same day):** three Screen-based screens declared
no `edges` and thus missed the top inset — `settings/appearance.tsx`,
`groups/[id]/(tabs)/settings.tsx` and `groups/[id]/(tabs)/index.tsx`
(only `bottom` or none) — headers sat behind the status bar. All now pass
`edges` including `top`; the rest of the app was audited grepping every
`<Screen` opening tag (32 screens) — every other screen either passes
`edges={['top', …]}` or handles the top inset itself on a raw `View` root.

**Contrast audit (same day):** measured WCAG ratios for 90 token pairs over
all three palettes (text ≥4.5, icons/UI ≥3). Dark & groupify passed nearly
everywhere; light mode had 14 failures — muted text 4.43, field placeholder
**2.79**, `text-accent` links/labels 2.97, success/danger textuable 2.6–3.3,
and white glyphs on solid chips (amber 1.87–2.08 the worst — live in ListRow
icon tiles). Fixes (both `themeColors.ts` + `global.css`, values-only):
light accent 38→30%, success 40→30, danger 56→48, link 36→28, focus 42→34,
muted 44→42, field-placeholder 58→43, warning 52→38, teal 34→30;
`warning-foreground` is now deep brown `hsl(30 35% 10%)` in all palettes
(white-on-amber was ≤2:1); dark/groupify danger 60→51–52 so white labels hit
AA. Post-fix audit: 90/90 pass (AA for text, 3:1 for icons).

Diagnosis lesson #3: a blank screen with **zero JS errors** means "component
ran, native paint failed" — bisect by replacing the root with a trivial raw
`View` (bg-red + Text) and screenshot. If the trivia paints, walk the kit
root; if not, suspect the host/context layer. And: `CI=1` on
`expo start` silently kills the file watcher — edits appear to have no effect
and every observation becomes stale; restart Metro without `CI` before
trusting any Fast-Refresh-based diagnosis, and verify a probe actually
reached the device (bundle rebuild line in the Metro log) before drawing
conclusions.
