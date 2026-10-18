/**
 * YouTube import service (spec 007, reworked per user feedback).
 *
 * Link resolution is fully server-side (`POST /api/v2/youtube-import/resolve`):
 * channel pages are scraped (og tags + `externalId`), video links go through
 * oEmbed, and playlists are resolved **with the signed-in user's own YouTube
 * authorization** — the backend reuses the Google session created by Google
 * sign-in (its availability is exposed as `youtubeSynced` on `/api/v3/me`).
 *
 * No client API keys: `ytdl`-style keyed flows were removed.
 */

import apiClient from '@/api/client';

export interface DraftChannel {
  channelId: string;
  name: string;
  url: string;
  thumbnail?: string;
  subscriberCount?: number;
  videoCount?: number;
}

export type ParsedLine =
  | { ok: true; raw: string; channelId: string; url: string }
  | { ok: true; raw: string; handle: string; url: string }
  | { ok: true; raw: string; playlistId: string; url: string }
  | { ok: true; raw: string; videoId: string; url: string }
  | { ok: false; raw: string; error: string };

export interface PlaylistRef {
  id: string;
  name: string;
}

export interface ServerResolveResult {
  channels: DraftChannel[];
  errors: { raw: string; error: string }[];
  /** Playlists found in the paste — used to name the destination group. */
  playlists?: PlaylistRef[];
}

/* ------------------------------------------------------------------ */
/* Input parsing (FR-1)                                                */
/* ------------------------------------------------------------------ */

/** Split a paste into candidate lines, dropping blanks and dedupes. */
export function splitPaste(text: string): string[] {
  const lines = text
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return [...new Set(lines)];
}

/** Parse one pasted line into a resolvable target. Never throws. */
export function parseLine(rawLine: string): ParsedLine {
  const raw = rawLine.trim();
  if (!raw) return { ok: false, raw, error: 'Empty line' };

  if (/^@[\w.\-]{3,}$/.test(raw)) {
    return { ok: true, raw, handle: raw.slice(1), url: `https://www.youtube.com/${raw}` };
  }

  let url: URL;
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`);
  } catch {
    return { ok: false, raw, error: 'Not a YouTube URL or @handle' };
  }

  const isYoutube = YOUTUBE_HOSTS.has(url.hostname.toLowerCase());
  if (!isYoutube) return { ok: false, raw, error: 'Not a YouTube URL' };

  const listId = url.searchParams.get('list');
  // PL… user playlists, UU… channel-uploads playlists, FL… favorites.
  if (listId && listId.length >= 12 && (/^PL/.test(listId) || /^UU/.test(listId) || /^FL/.test(listId))) {
    return { ok: true, raw, playlistId: listId, url: raw };
  }

  const watchId = url.searchParams.get('v') ?? (/youtu\.be/i.test(url.hostname) ? url.pathname.slice(1) : null);
  if (watchId) return { ok: true, raw, videoId: watchId, url: raw };

  const channel = url.pathname.match(/\/channel\/(UC[\w-]{20,})/);
  if (channel) return { ok: true, raw, channelId: channel[1], url: raw };

  const handle = url.pathname.match(/\/@([\w.\-]{3,})/);
  if (handle) return { ok: true, raw, handle: handle[1], url: raw };

  return { ok: false, raw, error: 'Unsupported YouTube path' };
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com']);

/* ------------------------------------------------------------------ */
/* Server-side resolution (FR-2)                                       */
/* ------------------------------------------------------------------ */

/**
 * Route parsed lines for resolution: playlist lines go to the server only
 * when the user has a synced YouTube account, otherwise they are blocked
 * with a friendly gate (pure, for tests + screen).
 */
export function splitForServer(parsed: ParsedLine[], youtubeSynced: boolean) {
  const server: string[] = [];
  const blocked: ParsedLine[] = [];
  for (const p of parsed) {
    if (!p.ok) continue;
    if ('playlistId' in p && !youtubeSynced) blocked.push(p);
    else server.push(p.raw);
  }
  return { server, blocked };
}

/**
 * Resolve a batch of raw links through the backend (channels/handles/videos
 * always; playlists too when the user's YouTube account is synced).
 * Throws on network/server failure — callers turn that into errors.
 */
export async function serverResolve(links: string[]): Promise<ServerResolveResult> {
  if (links.length === 0) return { channels: [], errors: [], playlists: [] };
  const res = await apiClient.post<ServerResolveResult>('/api/v2/youtube-import/resolve', { links });
  return {
    channels: res?.channels ?? [],
    errors: res?.errors ?? [],
    playlists: res?.playlists ?? [],
  };
}

/** Playlist titles arrive as e.g. "Lo-fi beats - Videos" — clean for a group name. */
export function cleanPlaylistTitle(title: string): string {
  return title.replace(/\s*[-–]\s*Videos?\s*$/i, '').trim() || title;
}

/* ------------------------------------------------------------------ */
/* Draft mapping                                                       */
/* ------------------------------------------------------------------ */

/** Payload for channelsApi.createInGroup (pure mapping, for tests + screen). */
export function draftToCreateRequest(draft: DraftChannel, groupId: string) {
  return {
    groupId,
    channelId: draft.channelId,
    name: draft.name,
    thumbnail: draft.thumbnail,
    url: draft.url,
    contentType: 'youtube' as const,
  };
}

/** Deduplicate drafts by channelId and drop ones already present. */
export function dedupeDrafts(drafts: DraftChannel[], existingIds: string[] = []): { deduped: DraftChannel[]; duplicates: number; skippedInTarget: number } {
  const seen = new Set<string>();
  const existing = new Set(existingIds);
  const deduped: DraftChannel[] = [];
  let duplicates = 0;
  let skippedInTarget = 0;
  for (const d of drafts) {
    if (seen.has(d.channelId)) {
      duplicates++;
      continue;
    }
    seen.add(d.channelId);
    if (existing.has(d.channelId)) {
      skippedInTarget++;
      continue;
    }
    deduped.push(d);
  }
  return { deduped, duplicates, skippedInTarget };
}
