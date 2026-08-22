import { Tabs } from 'expo-router';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';

export default function GroupDetailTabs() {
  const { isDark } = useTheme();
  console.log('[GroupDetailTabs] useTheme isDark:', isDark);
  const activeColor = getThemeColor('accent', isDark);
  const inactiveColor = getThemeColor('muted', isDark);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark ? 'hsl(150 12% 5%)' : 'hsl(120 20% 98%)',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          paddingTop: 8,
          height: 88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ focused }) => (
            <IconifyIcon
              name="lucide:info"
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="subgroups"
        options={{
          title: 'Subgroups',
          tabBarIcon: ({ focused }) => (
            <IconifyIcon
              name="lucide:folder-open"
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <IconifyIcon
              name="lucide:settings"
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}
