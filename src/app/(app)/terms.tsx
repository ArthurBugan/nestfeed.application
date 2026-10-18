import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { IconifyIcon } from '@/components/IconifyIcon';

const SECTIONS = [
  {
    icon: 'lucide:file-text',
    title: 'Acceptance of Terms',
    body: 'By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
  },
  {
    icon: 'lucide:user-check',
    title: 'User Responsibilities',
    body: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
  },
  {
    icon: 'lucide:shield',
    title: 'Privacy',
    body: 'Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our service, you consent to our privacy practices.',
  },
  {
    icon: 'lucide:ban',
    title: 'Prohibited Activities',
    body: 'You may not use our service for any illegal activities, distribute harmful content, or attempt to gain unauthorized access to our systems or other users\' accounts.',
  },
  {
    icon: 'lucide:circle-alert',
    title: 'Termination',
    body: 'We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.',
  },
] as const;

export default function TermsScreen() {
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Terms of Service" className="pt-4" />

      <View className="px-1 flex-row items-center gap-2 mb-6 mt-2">
        <IconifyIcon name="lucide:scale" size={20} className="text-accent" />
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
