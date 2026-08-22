import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabLayout() {
  const { isDark } = useTheme();
  console.log('[TabLayout] useTheme isDark:', isDark);

  return (
    <NativeTabs
      iconColor={{
        default: getThemeColor('muted-foreground', isDark),
        selected: getThemeColor('accent', isDark),
      }}
      backgroundColor={getThemeColor('background', isDark)}
      minimizeBehavior="automatic"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf="square.grid.2x2"
          src={<IconifyIcon name="lucide:layout" />}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="groups">
        <NativeTabs.Trigger.Icon
          sf="folder"
          src={<IconifyIcon name="lucide:folder" />}
        />
        <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="channels">
        <NativeTabs.Trigger.Icon
          sf="tv"
          src={<IconifyIcon name="lucide:tv" />}
        />
        <NativeTabs.Trigger.Label>Channels</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="animes">
        <NativeTabs.Trigger.Icon
          sf="play.rectangle"
          src={<IconifyIcon name="lucide:video" />}
        />
        <NativeTabs.Trigger.Label>Animes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Icon
          sf="ellipsis"
          src={<IconifyIcon name="tdesign:more" />}
        />
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
