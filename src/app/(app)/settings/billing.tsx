import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';
import { useAppIAP } from '@/hooks';
import { PLAN_BY_IAP_PRODUCT } from '@/types';

const PLAN_FEATURES: Record<string, string[]> = {
  basic: ['Up to 10 groups', 'Up to 1,000 channels', 'Subgroups', 'Share groups'],
  pro: ['Unlimited groups', 'Unlimited channels', 'Team collaboration', 'Priority support'],
};

const PLAN_TITLES: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
};

export default function BillingScreen() {
  const { isDark } = useTheme();
  const { connected, products, purchasing, buySubscription } = useAppIAP();

  const currentPlan = 'Free';

  const handleSubscribe = async (planName: string) => {
    tap();
    if (!connected) {
      Alert.alert('Not Available', 'In-app purchases are not available right now.');
      return;
    }
    await buySubscription(planName);
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Billing" className="pt-4" />

      {/* Current Plan */}
      <Card className="mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider">
            Current Plan
          </Text>
          <View className="px-3 py-1 rounded-lg bg-accent/10">
            <Text className="text-xs font-semibold text-accent">{currentPlan}</Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-foreground mb-1">Free Plan</Text>
        <Text className="text-sm text-muted">Basic features included</Text>
      </Card>

      {/* Connecting */}
      {!connected && products.length === 0 && (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
          <Text className="text-sm text-muted mt-2">Connecting to App Store...</Text>
        </View>
      )}

      {/* Plans from IAP products */}
      {products.length > 0 && (
        <>
          <View className="px-1 pb-2">
            <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Plans</Text>
          </View>
          <View className="gap-3 mb-8">
            {products.map((product) => {
              const planName = PLAN_BY_IAP_PRODUCT[product.id] || product.id;
              const title = product.displayName || PLAN_TITLES[planName] || product.title;
              const features = PLAN_FEATURES[planName] || [];

              return (
                <Card key={product.id}>
                  <Text className="text-lg font-bold text-foreground mb-1">{title}</Text>
                  <Text className="text-2xl font-bold text-foreground mb-3">
                    {product.displayPrice}
                    <Text className="text-sm font-normal text-muted">/mo</Text>
                  </Text>
                  <View className="mb-4 gap-2">
                    {features.map((f, i) => (
                      <View key={i} className="flex-row items-center gap-2">
                        <IconifyIcon name="lucide:check" size={14} color={getThemeColor('accent', isDark)} />
                        <Text className="text-sm text-foreground">{f}</Text>
                      </View>
                    ))}
                  </View>
                  <Button
                    label="Subscribe"
                    fullWidth
                    loading={purchasing}
                    onPress={() => handleSubscribe(planName)}
                  />
                </Card>
              );
            })}
          </View>
        </>
      )}

      {/* Restore Purchases */}
      <View className="items-center">
        <PressableScale
          onPress={() => tap()}
          className="items-center py-3 px-4"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Restore Purchases"
        >
          <Text className="text-sm font-semibold text-accent">Restore Purchases</Text>
        </PressableScale>
      </View>
    </Screen>
  );
}
