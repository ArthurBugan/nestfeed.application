# Feature: Import channels from YouTube (007)

## Problem
Channels are added one-by-one by hand (name, URL, thumbnail, counts).
YouTube URLs already contain (or expose) everything we need — the model
fields (`name`, `channelId`, `url`, `thumbnail`, `subscriberCount`,
`videoCount`) exist but are never auto-filled.

## Solution
A paste-anything importer: the user pastes one or many YouTube URLs (or
raw `@handle`s) and the app auto-resolves name, avatar/thumbnail, canonical
URL, and (optionally) statistics — then into a chosen or brand-new group.
Public playlists and multi-line pastes resolve into a **pre-built group**
with deduplicated channels.

## Keyless data strategy (no server changes)
The app must import with zero configuration:

| Input | Resolution |
|---|---|
| `/channel/UC…` URL | YouTube RSS feed for the channel ID (no key) |
| `@handle`, `/c/…`, `/user/…`, bare text | Resolve channel ID by scraping the channel page HTML (`externalId`) → RSS |
| `/playlist?list=…`, any URL with `list=` | Playlist RSS feed; each entry's `author/uri` yields a channel → dedupe → pre-built group |
| Multi-line paste | Split on newlines → resolve each → one batch |

Enrichment (optional): a YouTube Data API v3 key stored on-device
(Settings → YouTube API Key) unlocks `subscriberCount`/`videoCount`,
exact avatars, and 50-item playlist batches. Without a key, counts stay
empty and playlists cap at 15 entries (RSS default).

## Functional requirements
- **FR-1** Parse inputs: channel URL (`@handle`, `/channel/UC…`, `/c/…`,
  `/user/…`), playlist (`list=` param), bare `@word`, multi-line paste.
  Invalid lines are reported, never silently dropped.
- **FR-2** Resolve each channel: canonical name, `channelId` (UC…),
  canonical URL `youtube.com/channel/UC…`, thumbnail (unavatar.io for
  handle URLs; latest-video thumbnail fallback), latest-video titles.
- **FR-3** Playlists build a draft group named after the playlist; channel
  duplicates (by UC id) collapse into one with a count note.
- **FR-4** Import target: picker over existing groups **or** "New group"
  name field. Creating + importing happens as one action.
- **FR-5** Plan limits enforce via `user.maxChannels` / `user.maxGroups`
  and current counts; over-limit disables import and offers Billing.
- **FR-6** Duplicate `channelId` already in the target group is skipped
  (telegraphed in the preview list as "already in group").
- **FR-7** Failed resolutions (private, terminated, offline) surface in a
  friendly error state; other parsed lines still continue.
- **FR-8** Entry points: Channels tab header action, dashboard Quick
  Action chip, and the group add-channel screen.

## Acceptance criteria
1. Paste `https://www.youtube.com/channel/UC…` into `/import-youtube` →
   preview card shows name + thumbnail; import into existing group lands
   the channel in it with correct data.
2. Paste `list=…` playlist → group pre-built with N channels (≤15 keyless).
3. Paste 3 mixed URLs at once → all 3 resolve; 1 bad URL shows error line.
4. With `maxChannels` reached, import is blocked with plan guidance.
5. Works on light/dark/groupify themes; 200% Dynamic Type readable.
