# Feature: Ecosystem — widgets, Siri, iPad, Dynamic Type (008)

Make Groupify ambient: glanceable on the home screen, reachable by voice,
comfortable on iPad, and readable at any text size. Split into two phases
by risk.

## Phase A — pure React (this implementation)
- **FR-A1 Dynamic Type 200% pass**: every primary screen (dashboard, the
  five tabs, auth, settings, import) renders without clipped/truncated
  labels at `content-size = accessibility-extra-extra-extra-large`
  (XXXL). Titles/headers cap scaling at 1.4; body text scales fully;
  touch targets never fall below 44pt. Known hotspot: dashboard bento
  cards, tab bar labels, ScreenHeader title+subtitle.
- **FR-A2 iPad two-pane**: Groups and Channels tabs render a master-
  detail split when the window is wide (≥900pt width, either
  orientation); tapping a row shows the overview pane inline instead of
  pushing; iPhone layout is byte-identical to current behavior.
- **FR-A3 Deep-link intake**: `groupifyapp://groups/{id}` and
  `/channels` routes already resolve (expo-router); document + reuse as
  the handoff target for Phase B.

## Phase B — native extensions (staged, requires app rebuild)
- **FR-B1 Home-screen widget "Pinned shelf"**: WidgetKit extension with
  2 sizes (systemSmall = 1 group, systemMedium = up to 4 pinned group
  tiles) rendering name, icon tint, channel count; tap opens the group
  via the App Intent deep link. Data path: pinned group IDs from the
  app's storage shared group container → encoded JSON.
- **FR-B2 Siri "Open my Anime group"**: `AppIntent` per pinned group
  (PhraseMenu-poisonable short titles); launches the app to the group.
  No external library — the intent lives in the same Swift target as the
  widget.
- **FR-B3 Rebuild risk**: prebuild regeneration wipes pbxproj
  hand-edits; implementation adds the extension via the config-plugin
  path and re-verifies Google ads config + uniwind postinstall patch
  before the first native build.

## Acceptance criteria (Phase A)
1. Set simulator content-size to XXXL → dashboard, groups, channels,
   animes, more, settings, + import screens readable, no overlap.
2. iPad (Pro 13") landscape: Groups tab shows list left / selected group
   right; same for Channels.
3. iPhone layouts and all existing tests unchanged (jest 193+ suites).
