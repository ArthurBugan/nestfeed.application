import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from 'heroui-native';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { connected, products, purchasing, buySubscription } = useAppIAP();

  const currentPlan = 'Free';

  const handleSubscribe = async (planName: string) => {
    Haptics.selectionAsync();
    if (!connected) {
      Alert.alert('Not Available', 'In-app purchases are not available right now.');
      return;
    }
    await buySubscription(planName);
  };

  const bg = getThemeColor('background', isDark);
  const surface = getThemeColor('surface', isDark);
  const border = getThemeColor('border', isDark);
  const accent = getThemeColor('accent', isDark);
  const foreground = getThemeColor('foreground', isDark);

  console.log(connected, products, purchasing);

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: bg }}>
        <View style={{ paddingTop: insets.top }} className="px-5 pb-12">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.back(); }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: surface }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconifyIcon name="lucide:arrow-left" size={20} color={foreground} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Billing</Text>
            <View className="w-10" />
          </View>

          {/* Current Plan */}
          <View className="rounded-2xl p-5 mb-5" style={{ backgroundColor: surface, borderWidth: 1, borderColor: border }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Current Plan</Text>
              <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: `${accent}20` }}>
                <Text className="text-xs font-semibold" style={{ color: accent }}>{currentPlan}</Text>
              </View>
            </View>
            <Text className="text-2xl font-bold text-foreground mb-1">Free Plan</Text>
            <Text className="text-sm text-muted">Basic features included</Text>
          </View>

          {/* Connecting */}
          {!connected && products.length === 0 && (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color={accent} />
              <Text className="text-sm text-muted mt-2">Connecting to App Store...</Text>
            </View>
          )}

          {/* Plans from IAP products */}
          {products.length > 0 && (
            <>
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-1">Plans</Text>
              <View className="gap-3 mb-8">
                {products.map((product) => {
                  const planName = PLAN_BY_IAP_PRODUCT[product.id] || product.id;
                  const title = product.displayName || PLAN_TITLES[planName] || product.title;
                  const features = PLAN_FEATURES[planName] || [];

                  return (
                    <View
                      key={product.id}
                      className="rounded-2xl p-5"
                      style={{ backgroundColor: surface, borderWidth: 1, borderColor: border }}
                    >
                      <Text className="text-lg font-bold text-foreground mb-1">{title}</Text>
                      <Text className="text-2xl font-bold text-foreground mb-3">
                        {product.displayPrice}
                        <Text className="text-sm font-normal text-muted">/mo</Text>
                      </Text>
                      <View className="mb-4 gap-2">
                        {features.map((f, i) => (
                          <View key={i} className="flex-row items-center gap-2">
                            <IconifyIcon name="lucide:check" size={14} color={accent} />
                            <Text className="text-sm text-foreground">{f}</Text>
                          </View>
                        ))}
                      </View>
                      <Button
                        onPress={() => handleSubscribe(planName)}
                        fullWidth
                        loading={purchasing}
                      >
                        Subscribe
                      </Button>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Restore Purchases */}
          <TouchableOpacity
            className="items-center py-3"
            onPress={() => Haptics.selectionAsync()}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium" style={{ color: accent }}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
