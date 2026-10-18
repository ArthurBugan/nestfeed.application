import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import { Avatar } from 'heroui-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/hooks';

const menuItems = [
  { label: 'Websites', path: '/websites', icon: 'lucide:globe' },
  { label: 'Share Links', path: '/share-links', icon: 'lucide:link-2' },
  { label: 'Groupshelf', path: '/groupshelf', icon: 'lucide:library' },
  { label: 'Blog', path: '/blog', icon: 'lucide:newspaper' },
  { label: 'Settings', path: '/settings', icon: 'lucide:settings' },
];

/** Up to two uppercase initials for the profile avatar fallback. */
const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function MoreScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
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
    <Screen scroll edges={['top', 'bottom']}>
      {/* Header */}
      <View className="pt-4 pb-6">
        <ScreenHeader title="More" leading="none" />
      </View>

      {/* Profile Card */}
      <Card className="mb-6">
        <View className="flex-row items-center gap-4">
          <Avatar size="lg" alt={user?.name || 'Signed in user'}>
            <Avatar.Fallback>{initialsFor(user?.name || 'User')}</Avatar.Fallback>
          </Avatar>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {user?.name || 'User'}
            </Text>
            <Text className="text-sm text-muted">{user?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Menu */}
      <ListGroup className="mb-6">
        {menuItems.map((item) => (
          <ListRow
            key={item.path}
            icon={item.icon}
            title={item.label}
            onPress={() => router.push(item.path)}
          />
        ))}
      </ListGroup>

      {/* Sign Out */}
      <View className="pb-8">
        <Button
          label="Sign Out"
          variant="danger"
          icon="lucide:log-out"
          fullWidth
          onPress={handleLogout}
          accessibilityLabel="Sign Out"
        />
      </View>
    </Screen>
  );
}
