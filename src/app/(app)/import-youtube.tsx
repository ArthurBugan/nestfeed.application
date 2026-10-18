import { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'burnt';
import {
  parseLine,
  splitPaste,
  splitForServer,
  serverResolve,
  cleanPlaylistTitle,
  dedupeDrafts,
  draftToCreateRequest,
  type DraftChannel,
} from '@/services/youtube';
import { useCreateChannel, useCreateGroup, useGroups, useCurrentUser } from '@/hooks';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/Input';
import { Button, Chip } from '@/components/ui/Button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { tap } from '@/theme/haptics';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';

interface ResultState {
  channels: DraftChannel[];
  playlistName?: string;
  errors: string[];
  duplicates: number;
}

export default function YouTubeImportScreen() {
  const router = useRouter();
  const [pasteText, setPasteText] = useState('');
  const [resolution, setResolution] = useState<ResultState | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  const { data: groupsData } = useGroups({ page: 1, limit: 50 });
  const createChannel = useCreateChannel();
  const createGroup = useCreateGroup();
  const groups = groupsData?.data ?? [];
  const { isDark } = useTheme();
  const { data: currentUser } = useCurrentUser();
  /** Spec 007 rework: playlists resolve with the user's own synced YouTube
   *  account (server-side, via their Google session) — no API keys. */
  const youtubeSynced = !!currentUser?.youtubeSynced;
  const statusTint = getThemeColor(youtubeSynced ? 'success' : 'warning', isDark);
  const statusTintBg = getThemeColor(youtubeSynced ? 'success-soft' : 'warning-soft', isDark);

  const resolve = useCallback(async () => {
    tap();
    setResolution(null);
    const lines = splitPaste(pasteText);
    if (lines.length === 0) {
      toast({ title: 'Paste at least one YouTube link first', preset: 'error' });
      return;
    }
    setIsResolving(true);
    try {
      const parsed = lines.map(parseLine);
      const out: ResultState = { channels: [], errors: [], duplicates: 0 };

      // Unparseable lines fail immediately.
      for (const p of parsed) {
        if (!p.ok) out.errors.push(`"${p.raw}" — ${p.error}`);
      }

      // Channels/handles/videos always resolve server-side; playlists too —
      // with the user's synced YouTube account (Google session).
      const { server, blocked } = splitForServer(parsed, youtubeSynced);
      for (const p of blocked) {
        out.errors.push(`"${p.raw}" — Playlist imports need a synced YouTube account (sign in with Google)`);
      }

      if (server.length > 0) {
        try {
          const res = await serverResolve(server);
          out.channels.push(...res.channels);
          for (const e of res.errors) out.errors.push(`"${e.raw}" — ${e.error}`);
          const first = res.playlists?.[0];
          if (first) {
            out.playlistName = cleanPlaylistTitle(first.name);
            for (const extra of (res.playlists ?? []).slice(1)) {
              out.errors.push(`"${extra.id}" — Skipped naming (only one playlist title is used)`);
            }
          }
        } catch {
          out.errors.push('Could not reach the server to resolve links');
        }
      }

      const dd = dedupeDrafts(out.channels);
      out.channels = dd.deduped;
      out.duplicates = dd.duplicates;
      setResolution(out);
      if (out.errors.length) {
        toast({ title: `${out.errors.length} link${out.errors.length === 1 ? '' : 's'} failed to resolve`, preset: 'none', duration: 3 });
      }
    } finally {
      setIsResolving(false);
    }
  }, [pasteText, youtubeSynced]);

  const importCount = useMemo(
    () => (resolution?.channels.length ?? 0) + (resolution?.playlist?.channels.length ?? 0),
    [resolution]
  );

  const runImport = useCallback(async () => {
    if (!resolution) return;
    tap();
    setIsImporting(true);
    try {
      let groupId = selectedGroupId;
      if (!groupId) {
        const groupName = newGroupName.trim() || resolution.playlistName || 'My imported channels';
        const group = await createGroup.mutateAsync({
          name: groupName,
          description: resolution.playlistName ? `Imported from ${resolution.playlistName}` : undefined,
          category: 'Entertainment',
          icon: 'twemoji:rocket',
          enableGroupshelf: false,
        });
        groupId = group.id;
      }
      let ok = 0;
      let failed = 0;
      let done = 0;
      const total = resolution.channels.length;
      for (const draft of resolution.channels) {
        done++;
        setImportProgress(`Importing ${done}/${total}…`);
        try {
          await createChannel.mutateAsync(draftToCreateRequest(draft, groupId ?? ''));
          ok++;
        } catch {
          failed++;
        }
      }
      setImportProgress('');
      if (failed === 0) toast({ title: `Imported ${ok} channel${ok === 1 ? '' : 's'}`, preset: 'done' });
      else toast({ title: `Imported ${ok}, ${failed} failed`, preset: 'error' });
      setResolution(null);
      setPasteText('');
      setNewGroupName('');
      setSelectedGroupId(null);
      if (ok > 0) router.replace('/groups');
    } finally {
      setIsImporting(false);
    }
  }, [resolution, selectedGroupId, newGroupName, createChannel, createGroup, router]);

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4 pb-6">
          <ScreenHeader title="Import from YouTube" subtitle="Paste channel, playlist or video links" />
        </View>

        <View className="px-5">
          <Input
            label="YouTube links"
            testID="yt-import-paste"
            placeholder={'@mkbhd\nhttps://www.youtube.com/playlist?list=…\nPlease paste one link per line'}
            value={pasteText}
            onChangeText={setPasteText}
            multiline
            numberOfLines={4}
            autoCorrect={false}
          />
          <Button
            label={isResolving ? 'Resolving…' : 'Preview'}
            icon="lucide:search"
            onPress={resolve}
            loading={isResolving}
            disabled={isResolving || !pasteText.trim()}
          />
        </View>

        {resolution && (
          <View className="px-5 mt-2">
            {resolution.channels.length > 0 && (
              <PreviewSection title="Channels" subtitle={`${resolution.channels.length} resolved`} channels={resolution.channels} />
            )}
            {resolution.duplicates > 0 && (
              <Text className="text-xs text-muted mt-1">{resolution.duplicates} duplicate(s) merged</Text>
            )}
            {resolution.errors.map((e) => (
              <Text key={e} className="text-xs text-danger mt-1" accessibilityLabel={e}>
                {e}
              </Text>
            ))}

            <Text className="text-sm font-semibold text-muted uppercase tracking-wider mt-6 mb-3">
              Destination
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              <Chip label="New group" icon="lucide:folder-plus" onPress={() => setSelectedGroupId(null)} selected={selectedGroupId === null} />
              {groups.map((g) => (
                <Chip key={g.id} label={g.name} icon="lucide:folder" onPress={() => setSelectedGroupId(g.id)} selected={selectedGroupId === g.id} />
              ))}
            </View>
            {!selectedGroupId && (
              <Input
                label="New group name"
                placeholder={resolution.playlistName ?? 'My imported channels'}
                value={newGroupName}
                onChangeText={setNewGroupName}
                leftElement={<IconifyIcon name="lucide:folder" size={18} />}
              />
            )}

            <View className="mt-4">
              <Button
                label={isImporting ? importProgress || 'Importing…' : `Import ${importCount || ''}`.trim()}
                icon="lucide:download"
                onPress={runImport}
                loading={isImporting}
                disabled={isImporting || importCount === 0}
              />
            </View>
          </View>
        )}

        <View className="px-5 mt-8">
          <View className="flex-row items-start gap-2.5 p-4 rounded-2xl bg-surface border border-border/60">
            <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: statusTintBg }}>
              <IconifyIcon name={youtubeSynced ? 'lucide:badge-check' : 'lucide:info'} size={14} color={statusTint} />
            </View>
            <Text className="text-xs text-muted flex-1" accessibilityLabel="YouTube account status">
              {youtubeSynced
                ? 'YouTube account synced — playlists import with your own account.'
                : 'YouTube account not synced. Sign in with Google (and sync your channels) to import playlists. Channel links work without it.'}
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function PreviewSection({ title, subtitle, channels }: { title: string; subtitle: string; channels: DraftChannel[] }) {
  return (
    <View className="mb-4">
      <Text className="text-base font-bold text-foreground">{title}</Text>
      <Text className="text-xs text-muted mb-2">{subtitle}</Text>
      {channels.slice(0, 12).map((c) => (
        <View key={c.channelId} className="flex-row items-center gap-3 py-2">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-secondary">
            {c.thumbnail && (
              <Image source={{ uri: c.thumbnail }} className="w-10 h-10" accessibilityLabel={`Thumbnail for ${c.name}`} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {c.name}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {typeof c.subscriberCount === 'number'
                ? `${Intl.NumberFormat().format(c.subscriberCount)} subs`
                : c.url.replace('https://www.youtube.com', '')}
            </Text>
          </View>
        </View>
      ))}
      {channels.length > 12 && <Text className="text-xs text-muted mt-1">+{channels.length - 12} more…</Text>}
    </View>
  );
}
