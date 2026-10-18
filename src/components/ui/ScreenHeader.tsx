import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconifyIcon } from '@/components/IconifyIcon';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Leading affordance: back arrow (default), close X, or none. */
  leading?: 'back' | 'close' | 'none';
  onBack?: () => void;
  /** Trailing slot (actions, buttons). */
  right?: ReactNode;
  /** Render as a large title (default) or compact inline title. */
  size?: 'large' | 'compact';
  className?: string;
}

const ICONS = { back: 'lucide:arrow-left', close: 'lucide:x' } as const;

/**
 * Unified screen header (spec 005, FR-P2): one back affordance, one
 * typography scale, one hit target. Replaces the ~22 hand-rolled copies.
 */
export function ScreenHeader({
  title,
  subtitle,
  leading = 'back',
  onBack,
  right,
  size = 'large',
  className = '',
}: ScreenHeaderProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const icon = leading === 'none' ? null : ICONS[leading];

  return (
    <View className={`flex-row items-center gap-3 pb-2 ${className}`}>
      {icon ? (
        <PressableScale
          onPress={() => (onBack ? onBack() : router.back())}
          className="w-11 h-11 rounded-full items-center justify-center bg-surface"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={leading === 'back' ? 'Go back' : 'Close'}
        >
          <IconifyIcon name={icon} size={20} color={getThemeColor('foreground', isDark)} />
        </PressableScale>
      ) : null}

      <View className="flex-1 min-w-0">
        <Text
          numberOfLines={1}
          accessibilityRole="header"
          className={`font-bold text-foreground ${
            size === 'large' ? 'text-2xl' : 'text-lg'
          }`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-sm text-muted mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}

export default ScreenHeader;
