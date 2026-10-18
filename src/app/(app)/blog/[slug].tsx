import { View, Text, ScrollView, Share, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBlogPost } from '@/hooks';
import { Skeleton } from 'heroui-native';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { IconButton } from '@/components/ui/Button';
import { InlineAd } from '@/components/Admob';
import { IconifyIcon } from '@/components/IconifyIcon';
import { tap } from '@/theme/haptics';

const AD_RE = /<ins\s+class=["']adsbygoogle["']\s*>\s*<\/ins>\s*/gi;

export default function BlogPostScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: blogData, isLoading } = useBlogPost(slug);
  const { isDark } = useTheme();
  const post = blogData;

  const handleShare = async () => {
    tap();
    try {
      await Share.share({
        message: post?.title || 'Check out this blog post',
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background p-5">
        <Skeleton height={30} className="mb-4" />
        <Skeleton height={20} className="mb-2" />
        <Skeleton height={20} className="mb-2" />
      </ScrollView>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-background p-5 items-center justify-center">
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4 bg-default">
          <IconifyIcon name="lucide:file-x" size={32} className="text-muted" />
        </View>
        <Text className="text-muted text-center font-medium">Post not found</Text>
      </View>
    );
  }

  const segments: string[] = post.content.split(AD_RE);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background" showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3 border-b border-border">
          <ScreenHeader
            title="Blog Post"
            size="compact"
            right={
              <IconButton
                name="lucide:share-2"
                label="Share post"
                onPress={handleShare}
                variant="surface"
              />
            }
          />
        </View>

        <View className="px-5 pt-6 pb-6">
          {/* Title */}
          <Text className="text-2xl font-bold text-foreground mb-3 leading-tight">{post.title}</Text>

          {/* Date */}
          <View className="flex-row items-center gap-2 mb-6">
            <IconifyIcon name="lucide:calendar" size={14} color={getThemeColor('muted', isDark)} />
            <Text className="text-muted text-sm">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </Text>
          </View>

          {/* Content */}
          <View className="gap-4">
            {segments.map((segment, index) => {
              if (!segment.trim()) return null;
              return (
                <View key={index}>
                  <EnrichedMarkdownText
                    markdown={segment}
                    onLinkPress={({ url }) => Linking.openURL(url)}
                    markdownStyle={{
                      paragraph: { color: getThemeColor('foreground', isDark), marginTop: 0, marginBottom: 12 },
                      h1: { color: getThemeColor('foreground', isDark), fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
                      h2: { color: getThemeColor('foreground', isDark), fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
                      h3: { color: getThemeColor('foreground', isDark), fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
                      link: { color: getThemeColor('accent', isDark) },
                      strong: { color: getThemeColor('foreground', isDark), fontWeight: 'bold' },
                      em: { color: getThemeColor('foreground', isDark), fontStyle: 'italic' },
                      code: { color: getThemeColor('foreground', isDark), backgroundColor: getThemeColor('default', isDark), paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
                      codeBlock: { color: getThemeColor('foreground', isDark), backgroundColor: getThemeColor('default', isDark), padding: 12, borderRadius: 8 },
                      blockquote: { color: getThemeColor('muted', isDark), borderLeftWidth: 3, borderLeftColor: getThemeColor('accent', isDark), paddingLeft: 12 },
                    }}
                  />
                  {index < segments.length - 1 && <InlineAd />}
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
