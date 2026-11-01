---
name: figcraft-ui
description: >-
  Use when working with the Groupify `.figcraft` design file (the open-source
  ArtCraft FigCraft — a Rust Figma-alternative), or when converting/repairing
  figcraft screens, exporting design proofs to PNG, or porting an approved
  figcraft design into the React Native / Expo app. Triggers on: figcraft,
  groupify-app.figcraft, figcraft-cli, "design file", ArtCraft, render a
  screen, export a design, "the dashboard design", design→code.
---

# FigCraft → Groupify React Native workflow

This project designs in **ArtCraft FigCraft** (Rust, open source) via the
`figcraft-cli` tool, then ports approved screens into the Expo/React Native app
(`src/app/...`). This skill captures the non-obvious pipeline and gotchas for
both halves.

## When to use

- Editing, fixing, or adding screens in `groupify-app.figcraft` (repo root).
- Rendering design proofs to PNG for review.
- Porting an approved figcraft screen into the RN app.

Do **not** use for the figcraft.ai AI-image tool — that is a different product.

## Tooling

- `figcraft-cli` (installed at `~/.local/bin/figcraft-cli`, on PATH). 597
  subcommands plus `info`, `export`, `convert`, `render`, `run`, and an MCP
  server mode.
- The `.figcraft` file is a **zip** containing `document.json` + `thumbnail.png`.
- Node lives at `~/.nvm/versions/node/v23.11.0/bin` here; `npx` is not on the
  default PATH. Prefix RN commands with:
  `export PATH="$HOME/.nvm/versions/node/v23.11.0/bin:$PATH"`.

## The file

`document.json` is a graph: `{ nodes: { "<numericId>": node } }`. Node fields
that matter:

- `id` (number), `type` (`frame` | `text` | `vector` | `rectangle` | `page`),
  `name`, `width`, `height`, `children` (array of parent-less child **ids**).
- `parent` on a node is a **numeric id**, never a node object.
- `layout`: `{ mode: 'horizontal'|'vertical'|'grid', gap, cross_gap, padding:
  [t,r,b,l], main_align, cross_align, content_align, grid_columns, column_tracks,
  row_tracks, minHeight, ... }`.
- `child_layout`: `{ sizing_h, sizing_v: 'fixed'|'hug'|'fill', absolute,
  min_w/max_w/min_h/max_h, grid_column, grid_row, grid_column_span, ... }`.
- `transform`: `[a,b,c,d,x,y]`; **index 4 = x, index 5 = y** (stored position).
- text nodes: `characters`, `font_family`, `font_size`, `font_weight`, fills.
- paints: a solid paint is `{ type:'solid', color:{ r,g,b,a } }` — to read the
  color you must **unwrap** `.color` (the inner `{r,g,b,a}` object).

## THE critical rule: stored geometry vs re-layout

> **`figcraft-cli render` and `export` paint the *stored* geometry
> (width/height/transform). They do NOT recompute auto-layout.**

Consequences:
- A `hug`/`fill` child with a stale `0×0` (or old) stored size renders as
  nothing / the old size, even if its layout says it should grow.
- If you edit `layout`/`child_layout`/`characters` in `document.json` with a
  script, the stored sizes are now stale and the render is wrong.

To make the renderer reflect your structural edits, you must run the **Rust
engine** to re-bake geometry:

```
figcraft-cli run <script.json> --in groupify-app.figcraft --out groupify-app.figcraft
```

`run` re-layouts **only subtrees it marks dirty**. A no-op `run` will NOT
re-bake already-correct stored geometry (it skips untouched nodes). To force a
full recompute of a subtree, touch something the engine treats as a layout
input on the frame, e.g.:

```json
[
  { "command": "node.set", "params": { "ids": [<frameId>], "props": { "width": 393, "minHeight": 852 } } },
  { "command": "node.set", "params": { "ids": [<contentColumnId>], "props": { "minHeight": <pixelValue> } } }
]
```

Setting `minHeight`/`width` is the reliable way to dirty a subtree so the
engine recomputes all descendant `hug`/`fill` sizes and writes back correct
stored geometry. Then `export`/`render` is faithful.

## Working pipeline (build → re-bake → export)

1. **Structure** — edit `document.json` with a Python script (zip read/write):
   unzip `document.json`, mutate nodes, re-zip preserving `thumbnail.png`.
2. **Re-bake** — `figcraft-cli run reflow.json --in … --out …` to recompute
   layout for every subtree you touched.
3. **Proof** — `figcraft-cli export groupify-app.figcraft -o <dir> --format png --scale 1 --node <frameId>`
   (or without `--node` for all 13 screens). `--scale 1` = 393×852.
4. **Deploy** — copy the engine output into the repo and regenerate the project
   preview: `figcraft-cli render groupify-app.figcraft -o groupify-app.png --page "Page 1"`.
   Verify with `figcraft-cli info groupify-app.figcraft` (valid if it lists
   nodes + top-level frames).

### JSON idioms that bite
- Grid tracks `column_tracks` / `row_tracks` are **objects**
  `[{ sizing: 'fill' }, ...]`, not `'1fr'` strings.
- `parent` must be a numeric id.
- Paint `color` must be the inner `{r,g,b,a}` object (unwrap the solid dict).
- Copy a vector: `copy.deepcopy(original)`, assign a fresh `id`, set `parent`
  to the new parent's id, zero the `transform` x/y, and re-tint if needed.
- After reparenting/copying, stale stored `width/height/transform` on the new
  node won't show until a re-bake.

## Screens

13 frames (393×852 each) on one page: Dashboard(2), Groups(83), Channels(133),
Animes(182), More(228), Settings(289), Websites(358), Share Links(391),
Groupshelf(419), Group(447), New Group(490), Import YouTube(521),
Register(537). Font: Inter. Accent: emerald/teal.

Note: engine `run` **renumbers ids**. Always re-query node ids after a `run`
before editing (see `figcraft-cli info`, or read `document.json`).

## Design-system tokens (map figcraft → RN)

figcraft is the design source of truth; the app's real tokens live in
`src/theme/themeColors.ts` (light / dark / **groupify** variants; every key
exists in all three). Use `getThemeColor(key, isDark, variant?)` at runtime —
it resolves HSL strings. Reusable tint keys: `accent`, `teal`, `lime`,
`success`, `warning`, `danger`, and their `-soft` / `-foreground` siblings.

Map figcraft visuals to RN tokens, never to hardcoded hex, when porting.

## React Native port conventions

Unified primitives already exist — **reuse them, don't hand-roll**:

- `Screen` (`@/components/ui/Screen`): safe-area shell. `scroll`/`refreshing`/
  `onRefresh`/`edges`/`padded`.
- `ScreenHeader` (`@/components/ui/ScreenHeader`): title/subtitle, `leading`.
- `ListRow` (`@/components/ui/ListRow`): icon tile (`icon`, `iconTint`) or
  `leading` node, `title`, `subtitle` (2 lines), `value`, `trailing`, `chevron`,
  `switchValue`+`onSwitchChange`. Wraps in a surface card.
- `Chip` / `Button` (`@/components/ui/Button`).
- `PressableScale` (`@/components/ui/PressableScale`): press scale **+ haptic
  tick by default** (`haptic` prop). Do **not** call `tap()` inside its
  `onPress` — it double-fires.
- `IconifyIcon` (`@/components/IconifyIcon`): `name='lucide:…'`, `size`, `color`.
- Theme: `useTheme()` → `{ isDark }`; `getThemeColor(key, isDark)`.
- Haptics: `tap()` from `@/theme/haptics` (only for non-PressableScale presses).
- Styling: uniwind/Tailwind classes (`bg-surface`, `border-border`,
  `rounded-card`, `text-muted`, …) + `shadows` from `@/theme/colors`.

Real routes (no `/animes/[id]`, `/channels/[id]`, or `/websites/[id]` detail
screens exist): `/groups/[id]`, `/animes/change-group/[id]`,
`/channels/change-group/[id]`, `/groups/new`, `/import-youtube`, `/websites`
(top-level), `/groupshelf`, `/share-links`, `/settings`, `/blog`. Quick actions
should only point at routes that actually exist.

Data: `useDashboard()` → totals `{ groups, channels, animes, websites, … }`;
`useAnimesInfinite({ limit })` → `{ animes, isLoading, setIsActive, … }`
(enabled only when `setIsActive(true)` — call it in `useFocusEffect`). There is
no "continue watching" / `lastWatched` endpoint; "Recently Added" is served by
sorting `animes` by `updatedAt` desc.

## Verify

1. `export PATH="$HOME/.nvm/versions/node/v23.11.0/bin:$PATH"`.
2. `node_modules/.bin/tsc --noEmit` — must be clean.
3. `node_modules/.bin/jest` — 208 tests / 28 suites.
4. Screenshot the booted simulator, or `expo run:ios --device "iPhone 18 Pro"`
   then `xcrun simctl io booted screenshot`.

## Pitfalls checklist

- [ ] After any structural `document.json` edit, run a `run` that *dirties*
      the affected subtree (`minHeight`/`width`) before rendering.
- [ ] `render`/`export` show stored geometry, not live layout.
- [ ] Re-query ids after `run` (renumbering).
- [ ] Don't nest a `FlatList` inside `Screen`'s `ScrollView`; use a mapped map
      for small lists (≤ a few items).
- [ ] No double `tap()` in `PressableScale`/`Chip` handlers.
- [ ] Port to tokens, not hex.
