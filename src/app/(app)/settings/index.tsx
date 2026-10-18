import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox } from 'heroui-native';
import { useCurrentUser, useDeleteAccount } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from '@/components/Input';
import { tap } from '@/theme/haptics';

/** Small uppercase group caption used above each settings group. */
function SectionLabel({ title, danger = false }: { title: string; danger?: boolean }) {
  return (
    <View className="px-1 pb-1">
      <Text
        className={`text-xs font-semibold uppercase tracking-wider ${
          danger ? 'text-danger' : 'text-muted'
        }`}
      >
        {title}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [ackDataLoss, setAckDataLoss] = useState(false);
  const [ackNoRecovery, setAckNoRecovery] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleLogout = async () => {
    tap();
    logout();
    router.replace('/(auth)/login');
  };

  const canDelete = deleteConfirm === 'DELETE' && ackDataLoss && ackNoRecovery;

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      setDeleteOpen(false);
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  const openDeleteSheet = () => {
    tap();
    setDeleteOpen(true);
    setDeleteConfirm('');
    setAckDataLoss(false);
    setAckNoRecovery(false);
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" className="pt-4" />

      {/* Account */}
      <ListGroup className="mt-4">
        <SectionLabel title="Account" />
        <ListRow
          icon="lucide:user"
          title="Account"
          subtitle="Profile, password, security"
          onPress={() => router.push('/settings/account')}
        />
        <ListRow
          icon="lucide:palette"
          title="Appearance"
          subtitle="Theme, font size, language"
          onPress={() => router.push('/settings/appearance')}
        />
        <ListRow
          icon="lucide:credit-card"
          title="Billing"
          subtitle="Subscription, payment methods"
          onPress={() => router.push('/settings/billing')}
        />
      </ListGroup>

      {/* Preferences */}
      <ListGroup className="mt-6">
        <SectionLabel title="Preferences" />
        <ListRow
          icon="lucide:users"
          title="Groups"
          subtitle="Manage your groups"
          onPress={() => router.push('/settings/groups')}
        />
        <ListRow
          icon="lucide:lock"
          title="Privacy"
          subtitle="Data, sharing, analytics"
          onPress={() => router.push('/privacy')}
        />
      </ListGroup>

      {/* Support */}
      <ListGroup className="mt-6">
        <SectionLabel title="Support" />
        <ListRow
          icon="lucide:help-circle"
          title="Help & Support"
          onPress={() => router.push('/support')}
        />
        <ListRow
          icon="lucide:file-text"
          title="Terms & Privacy"
          onPress={() => router.push('/terms')}
        />
      </ListGroup>

      {/* Danger Zone */}
      <ListGroup className="mt-6">
        <SectionLabel title="Danger Zone" danger />
        <ListRow
          icon="lucide:trash-2"
          iconTint="danger"
          title="Delete Account"
          subtitle="Permanently remove your account and all data"
          onPress={openDeleteSheet}
          accessibilityLabel="Delete Account"
        />
      </ListGroup>

      <View className="flex-1" />
      <Button
        label="Sign Out"
        variant="danger"
        icon="lucide:log-out"
        fullWidth
        onPress={handleLogout}
        accessibilityLabel="Sign Out"
        className="mt-6 mb-8"
      />

      {/* Delete Account Confirmation Sheet */}
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account?">
        <View className="items-center mb-4">
          <View className="w-14 h-14 bg-danger/10 rounded-2xl items-center justify-center mb-3">
            <IconifyIcon name="lucide:alert-triangle" size={28} className="text-danger" />
          </View>
          <Text className="text-lg font-bold text-foreground text-center">Delete Account?</Text>
          <Text className="text-sm text-muted text-center mt-1">This cannot be undone.</Text>
        </View>

        <Text className="text-sm text-muted mb-4">
          All your data including groups, channels, and settings will be permanently deleted.
        </Text>

        <View className="gap-3 mb-4">
          <View className="flex-row items-center gap-3">
            <Checkbox
              isSelected={ackDataLoss}
              onSelectedChange={setAckDataLoss}
              accessibilityLabel="I understand all data will be lost"
            />
            <Text className="text-sm text-foreground flex-1">I understand all data will be lost</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox
              isSelected={ackNoRecovery}
              onSelectedChange={setAckNoRecovery}
              accessibilityLabel="This action cannot be undone"
            />
            <Text className="text-sm text-foreground flex-1">This action cannot be undone</Text>
          </View>
        </View>

        <Input
          placeholder="Type DELETE to confirm"
          value={deleteConfirm}
          onChangeText={setDeleteConfirm}
          autoCapitalize="characters"
        />

        <View className="flex-row gap-3">
          <Button label="Cancel" variant="flat" onPress={() => setDeleteOpen(false)} className="flex-1" />
          <Button
            label="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
            disabled={!canDelete}
            loading={deleteAccountMutation.isPending}
            className="flex-1"
          />
        </View>
      </Sheet>
    </Screen>
  );
}
