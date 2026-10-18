import { View, Text, Alert, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGroup } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { alpha } from '@/theme/alpha';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { tap } from '@/theme/haptics';

export default function ShareGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const { isDark } = useTheme();

  const handleShare = async () => {
    tap();
    try {
      await Share.share({
        message: `Check out this group: ${group?.name} - ${group?.description || ''}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  return (
    <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <ScreenHeader
        title="Share Group"
        size="compact"
        className="pt-4 pb-3 border-b border-border"
      />

      <View className="pt-8 pb-6">
        {group && (
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: alpha(getThemeColor('accent', isDark), 0.08) }}
            >
              <IconifyIcon name="lucide:share-2" size={40} className="text-accent" />
            </View>
            <Text className="text-xl font-bold text-foreground mb-1">{group.name}</Text>
            {group.description && (
              <Text className="text-muted text-center max-w-xs">{group.description}</Text>
            )}
          </View>
        )}

        <Button label="Share Group" icon="lucide:share-2" size="lg" fullWidth onPress={handleShare} />
      </View>
    </Screen>
  );
}
