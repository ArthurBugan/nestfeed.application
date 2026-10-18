# Review 007 — YouTube import (channel / video links, playlists via API key)

> Status: implemented + live-verified locally. Not committed yet.
> Client work is all in-spec; the pivot below changed where resolution happens.

## The pivot: keyless RSS is gone, server does the scraping

The original plan resolved links **on-device**: RSS `feeds/videos.xml` for UC
ids, plus a channel-page scrape for `@handle`s. During verification YouTube's
RSS endpoint started returning **404 with the Google "Error 404 (Not Found)!!1"
HTML page for *every* channel** — the feed service is deprecated. Playlist
pages also stopped embedding `playlistVideoRenderer` data in the initial HTML
(lazy loading), closing every other keyless route.

Pivot (user provided the backend repo for exactly this): resolution moved
server-side into `api.groupify`:

```
POST /api/v2/youtube-import/resolve   { links: string[] }
→ { success, data: { channels: DraftChannel[], errors: [{raw, error}] } }
```

- `/channel/UC…` → channel page scrape (`og:title`, `og:image`,
  `externalId` → verified UC id)
- `@handle` (bare or URL) → channel page → UC id → same scrape
- `watch?v=` / `youtu.be` → oEmbed (still alive) → `author_url` → channel
- playlists → explicit error pointing at the API-key path
- garbage/validation errors come back per-line so the UI can inline them

Server-side parsing is dependency-free (string finds, no regex crate). The
endpoint is auth-protected (JWT "auth-token" cookie, standard v2 pattern) and
de-dupes by channel id. `cargo build` is clean.

## What the app does now

- `splitPaste` + `parseLine` stay **client-side** (FR-1 validation, instant
  errors for non-YouTube junk before any network round-trip).
- All non-playlist lines go to the server in **one** `apiClient.post` batch.
- Playlists use the user's own YouTube Data API v3 key directly against
  googleapis: `playlistItems` → deduped `videoOwnerChannelId`s →
  `channels.list` enrichment; group name from `playlists.list`. The key lives
  in SecureStore (`youtube_api_key` service) and is only required for
  playlists — with YouTube's keyless feed gone, that's the honest UX.
- Optional API key also refreshes exact subscriber/video counts (the scraped
  HTML no longer exposes `subscriberCountText`; counts from the server chain
  are permanently missing until an API key is set or the server grows a
  keyed mode).
- Potential duplicate channel names between lines etc. are deduped client-side
  (FR-3/FR-6) — `dedupeDrafts` unchanged and still unit-tested.

## Backend contract discoveries (must-read for future imports)

During the live run two real contract mismatches surfaced — both are pre-existing
app/backend drift, not import bugs:

1. **`POST /api/v2/groups` requires `category` and `icon`** (422 otherwise);
   the app's existing "New Group" screen already sends them. The import screen
   now sends `category: 'Entertainment'`, `icon: 'twemoji:rocket'` and a
   defaulted group name (`resolution.playlist?.name → 'My imported channels'`).
2. **`POST /api/v2/channels` does not exist in the backend** (only
   GET/PATCH/DELETE). The import's `useCreateChannel` now targets the backend's
   real creation endpoint `POST /api/v3/groups/{group_id}/channels`
   (`channelsApi.createInGroup`), which is also permission-checked
   server-side. Query invalidations preserved.

The create loop keeps sequential per-channel progress and toasts
`Imported N / M failed` (the v3 endpoint enforces plan limits server-side and
those errors land in the failure count).

## Verification trail (local stack)

- Backend ran locally (`cargo run`, port 3010, same cloud DB as prod).
- A minimal Node dev proxy replicated the Coolify reverse proxy (`strip one
  leading /api`), because the Rust router serves `/authorize` where the app
  (baseURL `…/api`) sends `/api/authorize`; versioned paths also rely on the
  strip (`/../api/api/v2/groups → /api/v2/groups`).
- Created a disposable test account (`importtest+007@groupify.dev`) in the DB
  with a generated argon2id hash; confirmed email; logged in through the real
  app UI.
- Maestro: Import chip → paste `@GoogleDevelopers` → Preview → resolved card
  with real avatar → Import → redirect to Groups → group + channel row in DB
  (name `Google for Developers`, url `…/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`).
- jest 204/204, tsc clean (tests cover parsing,dedupe, keyed playlist mapping,
  enrichment merge, create payload shape).

## Known limitations / deferred

- **Deployment**: the endpoint exists only locally + not yet in the coolify
  build; until the backend deploys, resolution calls against prod will 404 →
  the UI says "Could not reach the server to resolve links".
- Playlist import still needs a real manual pass once a key is available.
- The optional API key provided by the user is not passed to the server;
  server-side keyed enrichment (better counts in one round trip) can be added
  later — the Rust struct already notes the seam.
- Avatars come from `og:image` (s900-c quality); fine on iOS.
- Test artifacts: local proxy/maestro files under `$TMPDIR/opencode`;
  `.env.local` was restored — nothing in the repo environment changed.

## 2026-10-18 rework — API keys removed; playlists resolve via the synced YouTube account

User decision: **no client API keys, ever**. Playlist import now uses the
signed-in user's own YouTube authorization:

- Backend `/api/v3/me` gained `youtubeSynced: bool` — true when the user has a
  Google session row (`sessions.provider = 'google'`, created by Google
  sign-in). Verified both ways locally (`false` for the password-only test
  user, `true` for a Google-linked account).
- Backend `POST /api/v2/youtube-import/resolve` accepts playlist links now:
  looks up the user's Google access token (stored in `sessions.session_id`,
  same convention as `/sync-channels-from-youtube`), **renews it through the
  refresh token when expired** (failed renewal ⇒ "not synced" semantics), then
  paginates `playlistItems?part=snippet,contentDetails`, extracts each video's
  owner (`snippet.videoOwnerChannelId`, fallback title), batches
  `channels?part=snippet` for names/thumbnails, and fetches the playlist title
  (`playlists?part=snippet`). New response field `data.playlists: [{id, name}]`.
- Parser accepts `PL*`, `UU*` (channel-uploads) and `FL*` list ids; mixes
  (`RD*`) are not playlist-resolvable and fall through to the video.
- Client (`youtube.ts` + import screen): the "Add YouTube API key" section and
  all keyed code paths (`resolvePlaylistWithKey`, `enrichWithApi`,
  `applyEnrichment`, `loadApiKey`/`saveApiKey`, SecureStore) are **deleted**.
  `splitForServer(parsed, youtubeSynced)` is the new pure gate: playlists go to
  the server only when synced, else a friendly per-line error is shown
  channels still resolve. `cleanPlaylistTitle` trims "- Videos" suffixes; the
  destination group is named after the first playlist when the user leaves the
  group-name field empty. Playlists merge into the one channel list + same
  dedupe flow (no separate playlist batch).
- Live verification (local backend :3010 + real Google session):
  `POST resolve` with `playlist?list=UUuAXFkgsw1L7xaCfnd5JJOw` returned
  `channels: [Rick Astley (name+avatar)]` and
  `playlists: [{name: "Uploads from Rick Astley"}]`.
  In-app (test user, not synced): status card ("YouTube account not synced…")
  renders and the pasted playlist produces the gate error; Import stays
  disabled. API-key UI is gone.
- Serde gotcha fixed along the way: `YtPlaylistSnippet` needed
  `#[serde(rename_all = "camelCase")]`; the owner id lives in
  `snippet.videoOwnerChannelId` (NOT `contentDetails.videoOwnerChannelId` in
  current playlistItems responses).
- jest 206/206, tsc clean. Still needs a Coolify deploy for prod.
