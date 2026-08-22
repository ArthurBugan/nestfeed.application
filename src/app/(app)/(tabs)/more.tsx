import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import {
  Text,
  Avatar,
  Separator,
} from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import { useCurrentUser } from '@/hooks';
import * as Haptics from 'expo-haptics';

const menuItems = [
  { label: 'Websites', path: '/websites', icon: 'lucide:globe' },
  { label: 'Share Links', path: '/share-links', icon: 'lucide:link-2' },
  { label: 'Groupshelf', path: '/groupshelf', icon: 'lucide:library' },
  { label: 'Blog', path: '/blog', icon: 'lucide:newspaper' },
  { label: 'Settings', path: '/settings', icon: 'lucide:settings' },
];

export default function MoreScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { isDark } = useTheme();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    Haptics.selectionAsync();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <View className="flex-1 px-5 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between py-5">
            <Text className="text-2xl font-bold text-foreground">More</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-2xl p-4 mb-5 border border-border/50">
            <View className="flex-row items-center gap-4">
              <Avatar name={user?.name} size="lg" />
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {user?.name || 'User'}
                </Text>
                <Text className="text-sm text-muted">{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Menu */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View>
              {menuItems.map((item, index) => (
                <View key={item.path}>
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-3.5"
                    onPress={() => { Haptics.selectionAsync(); router.push(item.path); }}
                    activeOpacity={0.7}
                  >
                    <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                      <IconifyIcon
                        name={item.icon}
                        size={20}
                        color={getThemeColor('foreground', isDark)}
                      />
                    </View>
                    <Text className="flex-1 text-base font-medium text-foreground">{item.label}</Text>
                    <IconifyIcon
                      name="lucide:chevron-right"
                      size={18}
                      color={getThemeColor('muted', isDark)}
                    />
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && <Separator className="mx-4" />}
                </View>
              ))}
            </View>
          </View>

          {/* Sign Out */}
          <View className="pb-6">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 bg-danger/10 border border-danger/20 rounded-xl py-3.5"
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <IconifyIcon
                name="lucide:log-out"
                size={20}
                color={getThemeColor('danger', isDark)}
              />
              <Text className="text-danger font-semibold">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  </View>
  );
}
