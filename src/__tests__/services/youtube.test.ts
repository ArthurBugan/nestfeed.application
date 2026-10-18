import { describe, expect, it } from '@jest/globals';
import {
  parseLine,
  splitPaste,
  splitForServer,
  cleanPlaylistTitle,
  dedupeDrafts,
  draftToCreateRequest,
  type DraftChannel,
} from '../../services/youtube';

describe('youtube parsing (spec 007 FR-1)', () => {
  it('parses a canonical /channel/UC… URL', () => {
    const p = parseLine('https://www.youtube.com/channel/UCsBjZmNHa1234567890abcd');
    expect(p.ok).toBe(true);
    if (p.ok) expect(p.channelId).toBe('UCsBjZmNHa1234567890abcd');
  });

  it('parses a @handle URL', () => {
    const p = parseLine('https://www.youtube.com/@mkbhd/videos');
    expect(p.ok).toBe(true);
    if (p.ok) expect('handle' in p && p.handle).toBe('mkbhd');
  });

  it('parses playlist URLs by their list param even on watch pages', () => {
    const p = parseLine('https://www.youtube.com/watch?v=abc&list=PL1234567890abcd');
    expect(p.ok).toBe(true);
    if (p.ok) expect('playlistId' in p && p.playlistId).toBe('PL1234567890abcd');
  });

  it('parses channel-uploads (UU…) playlists', () => {
    const p = parseLine('https://www.youtube.com/playlist?list=UUuAXFkgsw1L7xaCfnd5JJOw');
    expect(p.ok).toBe(true);
    if (p.ok) expect('playlistId' in p && p.playlistId).toBe('UUuAXFkgsw1L7xaCfnd5JJOw');
  });

  it('ignores radio/mix list params (RD…) and falls back to the video', () => {
    const p = parseLine('https://www.youtube.com/watch?v=abc&list=RDMM1234567890abcd');
    expect(p.ok).toBe(true);
    if (p.ok) expect('videoId' in p && p.videoId).toBe('abc');
  });

  it('parses a bare @handle and a video URL', () => {
    const h = parseLine('@mkbhd');
    expect(h.ok).toBe(true);
    if (h.ok) expect('handle' in h && h.handle).toBe('mkbhd');

    const v = parseLine('https://youtu.be/dQw4w9WgXcQ');
    expect(v.ok).toBe(true);
    if (v.ok) expect('videoId' in v && v.videoId).toBe('dQw4w9WgXcQ');
  });

  it('rejects non-YouTube URLs and garbage without throwing', () => {
    expect(parseLine('https://example.com/@x').ok).toBe(false);
    expect(parseLine('some random text').ok).toBe(false);
    expect(parseLine('').ok).toBe(false);
    // short/garbage list param still resolves the video itself (FR-1)
    const smallList = parseLine('https://www.youtube.com/watch?v=xyz&list=PLabc');
    expect(smallList.ok).toBe(true);
    if (smallList.ok) expect('videoId' in smallList && smallList.videoId).toBe('xyz');
  });

  it('splitPaste dedupes and drops blanks (FR-1 multiline)', () => {
    expect(splitPaste('a\n\nb \n a')).toEqual(['a', 'b']);
  });
});

describe('playlist sync gate (spec 007 — synced-account playlists)', () => {
  const channelLine = parseLine('https://www.youtube.com/channel/UCsBjZmNHa1234567890abcd');
  const playlistLine = parseLine('https://www.youtube.com/playlist?list=PL1234567890abcdEFGH');
  const badLine = parseLine('https://example.com/nope');

  it('with a synced account, playlists go to the server with the rest', () => {
    const { server, blocked } = splitForServer([channelLine, playlistLine, badLine], true);
    expect(server).toEqual([channelLine.ok ? channelLine.raw : '', playlistLine.ok ? playlistLine.raw : '']);
    expect(blocked).toEqual([]);
  });

  it('without a synced account, only playlists are blocked (channels still resolve)', () => {
    const { server, blocked } = splitForServer([channelLine, playlistLine, badLine], false);
    expect(server).toEqual([channelLine.ok ? channelLine.raw : '']);
    expect(blocked).toHaveLength(1);
    if (blocked[0].ok) expect('playlistId' in blocked[0]).toBe(true);
  });

  it('cleans YouTube playlist title suffixes for group naming', () => {
    expect(cleanPlaylistTitle('Lo-fi beats - Videos')).toBe('Lo-fi beats');
    expect(cleanPlaylistTitle('Lo-fi beats – Video')).toBe('Lo-fi beats');
    expect(cleanPlaylistTitle('My mix')).toBe('My mix');
  });
});

describe('dedupeDrafts (FR-3, FR-6)', () => {
  const a: DraftChannel = { channelId: 'UCa', name: 'A', url: 'u/a' };
  const a2: DraftChannel = { channelId: 'UCa', name: 'A dup', url: 'u/a2' };
  const b: DraftChannel = { channelId: 'UCb', name: 'B', url: 'u/b' };
  const e: DraftChannel = { channelId: 'UCe', name: 'Already there', url: 'u/e' };

  it('merges dupes and reports skipped-in-target separately', () => {
    const res = dedupeDrafts([a, a2, b, e], ['UCe']);
    expect(res.deduped.map((d) => d.channelId)).toEqual(['UCa', 'UCb']);
    expect(res.duplicates).toBe(1);
    expect(res.skippedInTarget).toBe(1);
  });
});

describe('draft shape guards', () => {
  it('maps a draft to the createInGroup payload contract', () => {
    const req = draftToCreateRequest(
      { channelId: 'UCa', name: 'A', url: 'https://www.youtube.com/channel/UCa' },
      'grp1'
    );
    expect(req).toEqual({
      groupId: 'grp1',
      channelId: 'UCa',
      name: 'A',
      thumbnail: undefined,
      url: 'https://www.youtube.com/channel/UCa',
      contentType: 'youtube',
    });
  });
});
