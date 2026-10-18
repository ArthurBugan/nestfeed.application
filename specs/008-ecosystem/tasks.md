# Tasks 008 — Ecosystem (Phase A: widgets/iPad/Dynamic Type React layer)

Status legend: `[x]` done, `[~]` done with follow-up note, `[ ]` not started.

Phase B (native WidgetKit + AppIntents) is intentionally **not started** — see
spec.md; Phase A ships first.

## 1. FR-A1 Dynamic Type 200% pass (XXXL)

- [x] Established the verification loop: `xcrun simctl ui <udid> content_size
  accessibility-extra-extra-extra-large` + app relaunch + screenshots of every
  primary screen (dashboard, Groups, Channels, Animes, More, Settings, Import)
- [x] `ScreenHeader`: title `maxFontSizeMultiplier={1.4}` (spec: display titles
  cap scaling); long large-titles wrap to 2 lines instead of ellipsizing;
  subtitle allowed 2 full-scaled lines before truncating
- [~] Kit buttons/chips/search/segmented: replaced fixed `h-*` with
  `min-h-* + py` so containers grow with scaled text
  (`Button` sm/md/lg + `Chip`, `SearchField`, `SegmentedControl`) — verified:
  "+ New" chip and dashboard "Preview" button no longer clip at XXXL
- [~] Dashboard bento: columns collapse to one when `fontScale >= 1.35`
  (two-up cards forced mid-word breaks like "Group s" at XXXL); iPhone default
  layout byte-identical (re-verified at default size)
- [x] Verified clean at XXXL: Groups list/cards, Channels rows, Animes rows,
  More rows/profile card, Settings rows, Import form + Preview
- [~] Known acceptable truncations at XXXL (standard iOS ellipsis, still
  one-per-screen readable): long row titles (channel names), More "Share Li…"
  row label, 2-line-capped header subtitles, h-14 `Sign Out` (Button fix not
  re-verified live on purpose — avoid signing out the real session; the same
  min-h component is verified elsewhere)

## 2. FR-A2 iPad two-pane (≥900pt)

- [x] `src/hooks/useTwoPane.ts`: `useWindowDimensions().width >= 900`
  (`TWO_PANE_MIN_WIDTH`), exported from `src/hooks`
- [x] `src/components/ui/DetailPane.tsx`: shared right-pane shell with a
  neutral "select an item" placeholder state
- [x] Groups tab: wide layout `flex-row` — left list FlashList 42% with
  border, right `DetailPane` with an inline `GroupOverview` (icon tile, name,
  description, subgroup count, "Open group" push button); row tap selects
  instead of pushing
- [x] Channels tab: same pattern — `ChannelOverview` (thumbnail/fallback icon,
  name, description, "Change group" + "Open on YouTube" buttons); row tap
  selects instead of pushing
- [x] Pane top padding respects `insets.top` (was underlapping the tab bar)
- [x] Live-verified on iPad Pro 13" (M5) simulator with the dev build:
  logged in with the disposable test account, both tabs render master-detail,
  tapping a group/channel shows the overview inline on the right
- [x] iPhone regression check (default content size): two-column bento back,
  Groups row still pushes `/groups/{id}` (verified via deep link target —
  see FR-A3); width 402 < 900 so `useTwoPane` is false

## 3. FR-A3 Deep-link intake

- [x] Verified `nestfeed://groups/{id}` resolves to the group detail screen on
  device (`xcrun simctl openurl` live test with group `450ac797…`)
- [~] **Spec correction (documented, spec left as-is):** the registered scheme
  is **`nestfeed://`** (app.json `scheme: "nestfeed"`, Info.plist also lists
  `com.groupifyapp://`), NOT `groupifyapp://` as spec.md FR-A3 says. `/channels/{id}`
  route paths resolve the same way through expo-router. This is the handoff
  target Phase B will use.

## 4. Gates

- [x] `npx tsc --noEmit`: 0 errors (excluding 3 pre-existing TS6059 in
  `jest.setup.ts`, `screenshots/text-overlay.tsx`, `scripts/patch-uniwind.js`)
- [x] `npx jest`: 204/204 passing (baseline preserved — no unit coverage was
  added for layout-only changes)
