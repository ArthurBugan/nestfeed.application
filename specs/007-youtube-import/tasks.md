# Tasks 007 — YouTube channel/playlist import

Status legend: `[x]` done, `[~]` done with follow-up note, `[ ]` not started.

## 1. Spec & research

- [x] Spec written (`spec.md`): FR-1..FR-8 + acceptance criteria
- [x] Keyless-first research: YouTube **deprecated the RSS feeds**
  (`feeds/videos.xml?channel_id=… → 404 "Error 404 (Not Found)!!1"` for every
  channel, every UA, host side and device side); playlist HTML no longer
  embeds `playlistVideoRenderer` content (lazy-loaded). Conclusion captured
  in review.md.

## 2. Resolution implementation (post-pivot: server-assisted)

- [x] Backend Rust module `api.groupify/src/api/v2/youtube_import.rs`:
  parse links (`/channel/UC…`, `@handle`, `watch?v=`, `youtu.be`, playlists),
  scrape channel pages (og:title/og:image + `externalId` UC-extraction),
  video → oEmbed → author channel, batch limit 50, `{success, data}` envelope,
  route `POST /api/v2/youtube-import/resolve`
- [x] `cargo build` clean (`src/api/v2/mod.rs` wired)
- [x] curl-verified: handle/channel/video/garbage/playlist all resolve or error correctly
- [x] Client `src/services/youtube.ts` rework: `splitPaste`/`parseLine` (FR-1),
  `serverResolve()` batch call, `draftsFromPlaylistItems` (keyed playlist),
  `enrichWithApi`/`applyEnrichment` (optional API key refreshes stats),
  `draftToCreateRequest`, `dedupeDrafts` (FR-3/FR-6); RSS code removed
- [x] Screen `src/app/(app)/import-youtube.tsx`: paste field, Preview,
  preview cards with real avatars, destination picker (New group chip +
  existing groups), default group name, sequential Import with progress,
  optional API key section (required only for playlists)
- [x] Entry points: dashboard Quick Action chip + Channels tab header button
- [x] `Input` kit component extended with `testID` forwarding (Maestro)

## 3. Persistence (backend contract fixes discovered live)

- [~] Group creation: `Category` + `icon` + `enableGroupshelf` are required by
  `POST /api/v2/groups` (422 otherwise) — screen sends `Entertainment`/`twemoji:rocket`
- [~] Channel creation: `POST /api/v2/channels` **does not exist** in the
  backend (only GET/PATCH/DELETE) — `useCreateChannel` + screen switched to
  `POST /api/v3/groups/{group_id}/channels` (`channelsApi.createInGroup`)
- [ ] Follow-up (server): consider aliasing `POST /api/v2/channels` to the v3
  in-group create so the app's original contract stops 404ing

## 4. Verification (local stack: cargo-run backend + /api-stripping proxy + sim)

- [x] jest 204/204 pass (11 youtube tests), tsc clean
- [x] Live: `@GoogleDevelopers` → Preview → avatar + "Google for Developers"
  resolved through the app → Import → group "My imported channels" created →
  channel row in DB with correct name/url (see screenshots `sim-resolved.png`,
  `sim-imported5.png`, backend log, psql check)
- [x] Live auth path: test user registered+confirmed (DB), login via app,
  cookie flow works through the strip-proxy
- [ ] Playlist import live-verified — **blocked**: requires a real YouTube Data
  API v3 key; code path is unit-tested (`draftsFromPlaylistItems`) and the UI
  explains the requirement
- [ ] Deploy: the endpoint must reach `coolify.nestfeed.app` before app-only
  prod testing works; deployment is the server repo's deploy pipeline

## 5. Cleanup

- [x] `.env.local` restored to `https://coolify.nestfeed.app/api`
- [x] Local test artifacts live in `$TMPDIR/opencode` (proxy script, maestro
  flows, screenshots); local backend process can be stopped (`PID 40663`)
