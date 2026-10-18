import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { IconifyIcon } from '@/components/IconifyIcon';

const SECTIONS = [
  {
    icon: 'lucide:lock',
    title: 'Data Collection',
    body: 'We collect your email and name for account purposes only. We do not share your data with third parties.',
  },
  {
    icon: 'lucide:database',
    title: 'Data Storage',
    body: 'Your data is stored securely using industry-standard encryption. We retain your data only as long as your account is active.',
  },
  {
    icon: 'lucide:user-x',
    title: 'Your Rights',
    body: 'You can request deletion of your data at any time. Contact us at support@nestfeed.app to exercise your rights.',
  },
  {
    icon: 'lucide:mail',
    title: 'Contact',
    body: 'If you have any questions about this privacy policy, please contact us at support@nestfeed.app.',
  },
] as const;

export default function PrivacyScreen() {
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Privacy Policy" className="pt-4" />

      <View className="px-1 flex-row items-center gap-2 mb-6 mt-2">
        <IconifyIcon name="lucide:shield-check" size={20} className="text-accent" />
        <Text className="text-sm text-muted">Last updated: May 2025</Text>
      </View>

      <View className="gap-3">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <View className="flex-row items-center gap-2 mb-3">
              <IconifyIcon name={section.icon} size={18} className="text-accent" />
              <Text className="text-base font-semibold text-foreground">{section.title}</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">{section.body}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
