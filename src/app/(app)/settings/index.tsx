import { TouchableOpacity, View, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Avatar, Separator, Text, Switch, Checkbox } from 'heroui-native';
import { useCurrentUser, useDeleteAccount } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { isDark } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const insets = useSafeAreaInsets();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [ackDataLoss, setAckDataLoss] = useState(false);
  const [ackNoRecovery, setAckNoRecovery] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleLogout = async () => {
    Haptics.selectionAsync();
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

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        <View style={{ paddingTop: insets.top }} className="px-5 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: getThemeColor('surface', isDark) }}>
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
          <View className="w-10" />
        </View>

        {/* Settings Sections */}
        <View className="gap-4 flex-1">
          {/* Account Section */}
          <View className="bg-surface rounded-2xl overflow-hidden border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Account</Text>
            </View>
            <View>
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/settings/account'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:user" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Account</Text>
                  <Text className="text-xs text-muted">Profile, password, security</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
              <Separator className="mx-4" />
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/settings/appearance'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:palette" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Appearance</Text>
                  <Text className="text-xs text-muted">Theme, font size, language</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
              <Separator className="mx-4" />
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/settings/billing'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:credit-card" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Billing</Text>
                  <Text className="text-xs text-muted">Subscription, payment methods</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="bg-surface rounded-2xl overflow-hidden border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Preferences</Text>
            </View>
            <View>
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/settings/groups'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:users" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Groups</Text>
                  <Text className="text-xs text-muted">Manage your groups</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
              <Separator className="mx-4" />
              <View className="flex-row items-center px-4 py-3.5">
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:bell" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Notifications</Text>
                  <Text className="text-xs text-muted">Push, email, SMS</Text>
                </View>
                <Switch isSelected={true} onSelectedChange={() => {}} />
              </View>
              <Separator className="mx-4" />
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/privacy'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:lock" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Privacy</Text>
                  <Text className="text-xs text-muted">Data, sharing, analytics</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Section */}
          <View className="bg-surface rounded-2xl overflow-hidden border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Support</Text>
            </View>
            <View>
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/support'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:help-circle" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Help & Support</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
              <Separator className="mx-4" />
              <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => { Haptics.selectionAsync(); router.push('/terms'); }} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                  <IconifyIcon name="lucide:file-text" size={20} color={getThemeColor('foreground', isDark)} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Terms & Privacy</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="bg-surface rounded-2xl overflow-hidden border border-danger/30 mt-4">
          <View className="px-4 py-3">
            <Text className="text-xs font-semibold text-danger uppercase tracking-wider">Danger Zone</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5"
            onPress={() => { Haptics.selectionAsync(); setDeleteOpen(true); setDeleteConfirm(''); setAckDataLoss(false); setAckNoRecovery(false); }}
            activeOpacity={0.7}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-danger/10">
              <IconifyIcon name="lucide:trash-2" size={20} color={getThemeColor('danger', isDark)} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-danger">Delete Account</Text>
              <Text className="text-xs text-muted">Permanently remove your account and all data</Text>
            </View>
            <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View className="mt-auto pt-5">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-danger/10 border border-danger/20 rounded-xl py-3.5"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <IconifyIcon name="lucide:log-out" size={20} color={getThemeColor('danger', isDark)} />
            <Text className="text-danger font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-muted rounded-full mb-4" />
              <View className="w-14 h-14 bg-danger/10 rounded-2xl items-center justify-center mb-3">
                <IconifyIcon name="lucide:alert-triangle" size={28} color={getThemeColor('danger', isDark)} />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">Delete Account?</Text>
              <Text className="text-sm text-muted text-center mt-1">This cannot be undone.</Text>
            </View>

            <Text className="text-sm text-muted mb-4">
              All your data including groups, channels, and settings will be permanently deleted.
            </Text>

            <View className="gap-3 mb-4">
              <View className="flex-row items-center gap-3">
                <Checkbox isSelected={ackDataLoss} onSelectedChange={setAckDataLoss} />
                <Text className="text-sm text-foreground flex-1">I understand all data will be lost</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Checkbox isSelected={ackNoRecovery} onSelectedChange={setAckNoRecovery} />
                <Text className="text-sm text-foreground flex-1">This action cannot be undone</Text>
              </View>
            </View>

            <View
              className="rounded-xl px-4 py-3 mb-5"
              style={{ backgroundColor: getThemeColor('surface', isDark), borderWidth: 1, borderColor: getThemeColor('border', isDark) }}
            >
              <TextInput
                className="text-foreground text-base py-1"
                placeholder="Type DELETE to confirm"
                placeholderTextColor={getThemeColor('muted', isDark)}
                value={deleteConfirm}
                onChangeText={setDeleteConfirm}
                autoCapitalize="characters"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center py-3.5 rounded-xl"
                style={{ backgroundColor: getThemeColor('surface', isDark) }}
                onPress={() => setDeleteOpen(false)}
                activeOpacity={0.7}
              >
                <Text className="text-foreground font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center py-3.5 rounded-xl ${!canDelete ? 'opacity-50' : ''}`}
                style={{ backgroundColor: getThemeColor('danger', isDark) }}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
                disabled={!canDelete || deleteAccountMutation.isPending}
              >
                <Text className="text-white font-semibold">
                  {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
