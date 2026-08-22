import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  subtitle?: string;
}

export function DashboardHeader({ title, description, action, subtitle }: DashboardHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {description && (
          <Text className="text-sm text-muted mt-0.5">{description}</Text>
        )}
        {subtitle && (
          <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.7}
          className="bg-accent px-4 py-2 rounded-xl ml-3"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-accent-foreground font-semibold text-sm">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default DashboardHeader;
