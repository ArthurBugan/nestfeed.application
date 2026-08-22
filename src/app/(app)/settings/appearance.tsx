import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, RadioGroup, Radio, Separator } from 'heroui-native';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from 'heroui-native';
import * as Haptics from 'expo-haptics';

const themes = [
  { value: 'system', label: 'System', description: 'Follow device settings', icon: 'lucide:monitor' },
  { value: 'light', label: 'Light', description: 'Always use light mode', icon: 'lucide:sun' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode', icon: 'lucide:moon' },
] as const;

const fontSizes = ['small', 'medium', 'large'] as const;

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark, fontSize, setFontSize, reduceMotion, setReduceMotion } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        <View style={{ paddingTop: insets.top }} className="px-5 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.back(); }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: getThemeColor('surface', isDark) }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Appearance</Text>
            <View className="w-10" />
          </View>

          {/* Theme Selection */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Theme</Text>
            </View>
            <RadioGroup
              value={theme}
              onValueChange={(value) => { Haptics.selectionAsync(); setTheme(value); }}
              className="px-2"
            >
              {themes.map((t) => (
                <RadioGroup.Item key={t.value} value={t.value} className="py-3">
                  <View className="flex-row items-center gap-3 px-3">
                    <Radio />
                    <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                      <IconifyIcon name={t.icon} size={20} color={getThemeColor('foreground', isDark)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">{t.label}</Text>
                      <Text className="text-sm text-muted">{t.description}</Text>
                    </View>
                  </View>
                </RadioGroup.Item>
              ))}
            </RadioGroup>
          </View>

          {/* Display Options */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Display</Text>
            </View>
            <View className="px-4 py-3">
              <Text className="text-base font-medium text-foreground mb-3">Font Size</Text>
              <View className="flex-row gap-2">
                {fontSizes.map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? 'primary' : 'flat'}
                    size="sm"
                    onPress={() => { Haptics.selectionAsync(); setFontSize(size); }}
                    className="flex-1"
                    accessibilityRole="button"
                    accessibilityLabel={`Font size ${size}`}
                    accessibilityState={{ selected: fontSize === size }}
                  >
                    <Text className={fontSize === size ? 'font-semibold' : ''}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>
            <Separator className="mx-4" />
            <View className="px-4 py-3">
              <Text className="text-base font-medium text-foreground mb-3">Language</Text>
              <TouchableOpacity className="bg-default rounded-xl px-4 py-3 flex-row items-center justify-between" activeOpacity={0.7} accessible accessibilityLabel="Language: English (US)">
                <Text className="text-foreground">English (US)</Text>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Accessibility */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Accessibility</Text>
            </View>
            <View className="px-4 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <IconifyIcon name="lucide:move" size={18} color={getThemeColor('foreground', isDark)} />
                    <Text className="text-base font-medium text-foreground">Reduce Motion</Text>
                  </View>
                  <Text className="text-xs text-muted">Minimize animations across the app</Text>
                </View>
                <Switch
                  isSelected={reduceMotion}
                  onSelectedChange={(value) => {
                    Haptics.selectionAsync();
                    setReduceMotion(value);
                  }}
                  accessibilityLabel="Reduce Motion"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
