# Review 008 — Ecosystem Phase A (Dynamic Type, iPad two-pane, deep links)

Implementation date: 2026-10-18
Status: **Phase A complete and live-verified. Phase B (WidgetKit/AppIntents
native extension) intentionally deferred — next session.**

## What shipped

### FR-A1 — Dynamic Type 200% (XXXL) pass

Verification method: `xcrun simctl ui <udid> content_size
accessibility-extra-extra-extra-large`, app relaunch (Fast Refresh proved
unreliable all session), screenshots of dashboard, Groups, Channels, Animes,
More, Settings, Import. Findings fixed in code:

| Symptom at XXXL | Root cause | Fix |
|---|---|---|
| "Dashboard"/"Gr…"/"Chann…" headers truncated | titles scaled fully, `numberOfLines=1` | `maxFontSizeMultiplier={1.4}` on `ScreenHeader` title; large titles also get `numberOfLines=2` |
| "Your content at a glance" cut mid-thought | subtitle `numberOfLines=1` | subtitle `numberOfLines=2` (body still scales fully per spec) |
| "+ New" / "Sign Out" text vertically clipped | fixed `h-10/12/14` button/chip heights | `min-h-*` + vertical padding in `Button` (all sizes), `Chip`, `SearchField`, `SegmentedControl` |
| Bento cards wrapped mid-word ("Group s") | single scaled word wider than a 48% column | dashboard collapses to one column at `fontScale >= 1.35` (`useWindowDimensions`) |
| "Import from YouTube" ellipsized at the cap | long title still too wide | `numberOfLines=2` for large headers |

Re-verified after the fixes: dashboard, Groups (+ New chip), Channels, Animes,
More, Settings, Import + Preview all render without clipping at XXXL. Standard
iOS ellipsis on long *row* titles (e.g. channel names) was judged acceptable —
it is what Apple's own list views do at accessibility sizes.

Note: the settings screen at XXXL looks busy (3-line subtitles push rows tall)
but nothing clips or overlaps — left as-is.

### FR-A2 — iPad two-pane at ≥900pt

- `useTwoPane()` hook (`src/hooks/useTwoPane.ts`) + `TWO_PANE_MIN_WIDTH = 900`.
- `DetailPane` (`src/components/ui/DetailPane.tsx`) shared shell + placeholder.
- Groups tab: 42% list / 58% overview; `GroupOverview` inline (icon tile, name,
  description, subgroup count, "Open group" push). Tapping selects, no push.
- Channels tab: same split; `ChannelOverview` inline (channel thumbnail,
  description, "Change group", "Open on YouTube" via `Linking`).
- Pane wrapper pads with `insets.top + 16` (first version let the tab bar
  overlap the pane content).

Live-verified on iPad Pro 13" (M5) simulator, dev build (Debug),
`TARGETED_DEVICE_FAMILY = "1,2"` confirmed in `project.pbxproj`, app.json
`supportsTablet: true`. Screenshot trail in temp dir: `ipad-pane4.png` (groups
overview), `ipad-chan4.png` (channel overview with real Google favicon).
Login used the disposable test account (`importtest+007@groupify.dev`), so
prod data untouched.

iPhone regression: default content size re-verified — bento stays two-column,
(Group detail target verified reachable; see FR-A3) width 402 < 900 ⇒
two-pane unreachable on iPhones.

Maestro notes (again): point-taps are unreliable on iPad FlashList rows —
tapping by visible text worked ("Google for Dev.*"), point tap on the group
row worked. System "Save password" AutoFill sheet is NOT tappable by maestro
(needed an app relaunch to clear).

### FR-A3 — Deep links

`xcrun simctl openurl nestfeed://groups/450ac797-f12b-487f-a89d-c7009661b195`
opened the group detail (Overview hero, Subgroups/Settings tabs) — verified
live on iPhone 18 Pro sim. **Spec correction:** the real scheme is
`nestfeed://` (app.json), not `groupifyapp://` — also useful knowledge for
universal links (`applinks:nestfeed.app` already in Info.plist).

## Known-quirks / follow-ups

1. **Phase B not started** (native targets): WidgetKit widget, AppIntents
   shortcuts, rebuild + ads config / uniwind postinstall re-verification.
2. Backend `/api/v2/youtube-import/resolve` still needs deployment to Coolify
   for prod import tests (from 007).
3. jest/tsc gates green: 204/204, tsc clean except the 3 pre-existing TS6059.
4. All 007+008 work remains **uncommitted** on `feat/init-app`.
