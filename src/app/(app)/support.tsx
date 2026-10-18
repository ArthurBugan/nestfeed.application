import { Text, View, Linking } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Card } from '@/components/ui/Card';
import { IconifyIcon } from '@/components/IconifyIcon';
import { tap } from '@/theme/haptics';

export default function SupportScreen() {
  const openEmail = () => {
    tap();
    Linking.openURL('mailto:support@nestfeed.app');
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Support" className="pt-4" />

      {/* Hero */}
      <View className="items-center mb-8 mt-4">
        <View className="w-20 h-20 rounded-tile items-center justify-center mb-4 bg-accent/10">
          <IconifyIcon name="lucide:life-buoy" size={40} className="text-accent" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2">How can we help?</Text>
        <Text className="text-muted text-center max-w-xs">
          We're here to help. Reach out and we'll respond as soon as possible.
        </Text>
      </View>

      {/* Contact Options */}
      <ListGroup className="mb-6">
        <ListRow
          icon="lucide:mail"
          iconTint="accent"
          title="Email Us"
          subtitle="support@nestfeed.app"
          onPress={openEmail}
          accessibilityLabel="Email support"
        />
      </ListGroup>

      {/* Response Time */}
      <Card variant="filled">
        <View className="flex-row items-center gap-3">
          <IconifyIcon name="lucide:clock" size={20} className="text-accent" />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Response Time</Text>
            <Text className="text-sm text-muted">We typically respond within 24-48 hours</Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
