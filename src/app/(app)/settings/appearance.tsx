import { View, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Button } from '@/components/ui/Button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { tap } from '@/theme/haptics';

const THEMES = [
  { value: 'system', label: 'System', description: 'Follow device settings', icon: 'lucide:monitor' },
  { value: 'light', label: 'Light', description: 'Always use light mode', icon: 'lucide:sun' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode', icon: 'lucide:moon' },
  { value: 'groupify', label: 'Groupify', description: 'Brand emerald theme', icon: 'lucide:sparkles' },
] as const;

const FONT_SIZES = ['small', 'medium', 'large'] as const;

export default function AppearanceSettingsScreen() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    reduceMotion,
    setReduceMotion,
    hapticsEnabled,
    setHapticsEnabledPref,
  } = useTheme();

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Appearance" className="pt-2" />

      <ListGroup className="mt-4">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Theme</Text>
        </View>
        {THEMES.map((t) => (
          <ListRow
            key={t.value}
            icon={t.icon}
            title={t.label}
            subtitle={t.description}
            chevron={false}
            onPress={() => {
              tap();
              setTheme(t.value);
            }}
            accessibilityLabel={`${t.label} theme`}
            trailing={
              theme === t.value ? (
                <IconifyIcon name="mdi:check-circle" size={22} className="text-accent" />
              ) : undefined
            }
          />
        ))}
      </ListGroup>

      <ListGroup className="mt-6">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Display</Text>
        </View>
        <View className="bg-surface rounded-card p-4">
          <Text className="text-base font-medium text-foreground mb-3">Font Size</Text>
          <View className="flex-row gap-2">
            {FONT_SIZES.map((size) => (
              <Button
                key={size}
                label={size.charAt(0).toUpperCase() + size.slice(1)}
                variant={fontSize === size ? 'primary' : 'flat'}
                size="sm"
                onPress={() => {
                  tap();
                  setFontSize(size);
                }}
                className="flex-1"
                accessibilityLabel={`Font size ${size}`}
                testID={`font-size-${size}`}
              />
            ))}
          </View>
          <Text className="text-xs text-muted mt-2">
            Base text size. Your device Dynamic Type setting still applies on top.
          </Text>
        </View>

        <ListRow
          icon="lucide:move"
          title="Reduce Motion"
          subtitle="Minimize animations across the app"
          chevron={false}
          switchValue={reduceMotion}
          onSwitchChange={(value) => {
            tap();
            setReduceMotion(value);
          }}
          testID="reduce-motion-row"
        />

        <ListRow
          icon="lucide:vibrate"
          title="Haptics"
          subtitle="Tactile feedback on taps and confirmations"
          chevron={false}
          switchValue={hapticsEnabled}
          onSwitchChange={(value) => {
            setHapticsEnabledPref(value);
            if (value) tap();
          }}
          testID="haptics-row"
        />
      </ListGroup>
    </Screen>
  );
}
