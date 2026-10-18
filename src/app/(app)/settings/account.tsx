import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Avatar } from 'heroui-native';
import { useCurrentUser } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from '@/components/Input';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import { tap } from '@/theme/haptics';

/** Up to two uppercase initials for the profile avatar fallback. */
const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const { isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    tap();
    Toast.success('Profile updated');
  };

  const handleLogout = async () => {
    tap();
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
      <ScreenHeader
        title="Account"
        className="pt-4"
        right={
          <Button
            label="Save"
            size="sm"
            onPress={handleSave}
            accessibilityLabel="Save profile changes"
          />
        }
      />

      {/* Profile Card */}
      <Card className="mb-6 items-center">
        <View className="relative mb-4">
          <Avatar size="lg" alt={user?.name || 'Signed in user'}>
            <Avatar.Fallback>{initialsFor(user?.name || 'User')}</Avatar.Fallback>
          </Avatar>
          <View className="absolute bottom-0 right-0 bg-accent rounded-full p-1.5 border-2 border-background">
            <IconifyIcon name="lucide:camera" size={14} color={getThemeColor('accent-foreground', isDark)} />
          </View>
        </View>
        <Text className="text-lg font-semibold text-foreground">{user?.name || 'User'}</Text>
        <Text className="text-sm text-muted">{user?.email}</Text>
      </Card>

      {/* Personal Information */}
      <View className="px-1 pb-1">
        <Text className="text-xs font-semibold text-muted uppercase tracking-wider">
          Personal Information
        </Text>
      </View>
      <Card className="mb-6">
        <View className="-mb-4">
          <Input label="Name" value={name} onChangeText={setName} placeholder="Enter your name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
          />
        </View>
      </Card>

      {/* Security */}
      <ListGroup className="mb-6">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Security</Text>
        </View>
        <ListRow
          icon="lucide:bell"
          title="Push Notifications"
          subtitle="Receive push notifications"
          chevron={false}
          switchValue={notifications}
          onSwitchChange={setNotifications}
          accessibilityLabel="Push Notifications"
        />
        <ListRow
          icon="lucide:shield"
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of security"
          chevron={false}
          switchValue={twoFactor}
          onSwitchChange={setTwoFactor}
          accessibilityLabel="Two-Factor Authentication"
        />
        <ListRow
          icon="lucide:key"
          title="Change Password"
          onPress={() => router.push('/settings/account/change-password')}
        />
      </ListGroup>

      {/* Danger Zone */}
      <ListGroup className="mb-6">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-danger uppercase tracking-wider">
            Danger Zone
          </Text>
        </View>
        <ListRow
          icon="lucide:trash-2"
          iconTint="danger"
          title="Delete Account"
          subtitle="This action cannot be undone"
          onPress={() =>
            Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.')
          }
          accessibilityLabel="Delete Account"
        />
      </ListGroup>

      <Button
        label="Sign Out"
        variant="danger"
        icon="lucide:log-out"
        fullWidth
        onPress={handleLogout}
        accessibilityLabel="Sign Out"
        className="mb-8"
      />
    </Screen>
  );
}
