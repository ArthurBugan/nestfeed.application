import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Switch } from 'heroui-native';
import { IconifyIcon, type IconifyIconProps } from '@/components/IconifyIcon';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor, type ThemeColorKey } from '@/theme/themeColors';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Leading icon in a tinted tile (iconify name). */
  icon?: IconifyIconProps['name'];
  /** Tile background tint (default: `default` token). */
  iconTint?: 'default' | 'accent' | 'danger' | 'success' | 'warning';
  /** Leading element overriding the icon tile (e.g. an Avatar). */
  leading?: ReactNode;
  /** Trailing text value (right-aligned, muted). */
  value?: string;
  /** Trailing element (switch, chevron, badge…). */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Show the chevron affordance (default: true when onPress). */
  chevron?: boolean;
  className?: string;
  /** Render the trailing Switch bound to these props. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  accessibilityLabel?: string;
  testID?: string;
}

const TINTS = {
  default: 'default',
  accent: 'accent',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
} as const;

/** Foreground token that reads correctly on each tile tint. */
const TINT_FOREGROUND = {
  default: 'default-foreground',
  accent: 'accent-foreground',
  danger: 'danger-foreground',
  success: 'success-foreground',
  warning: 'warning-foreground',
} as const satisfies Record<keyof typeof TINTS, ThemeColorKey>;

/**
 * Unified list/settings row (spec 005, FR-P6): icon tile + title + subtitle +
 * value/chevron/switch. Replaces the ~20 hand-rolled settings rows and the
 * divergent list-row styles.
 */
export function ListRow({
  title,
  subtitle,
  icon,
  iconTint = 'default',
  leading,
  value,
  trailing,
  onPress,
  chevron,
  className = '',
  switchValue,
  onSwitchChange,
  accessibilityLabel,
  testID,
}: ListRowProps) {
  const { isDark } = useTheme();
  const showChevron = chevron ?? (!!onPress && !trailing && switchValue === undefined);

  const content = (
    <>
      {leading ??
        (icon ? (
          <View
            className="w-11 h-11 rounded-xl items-center justify-center"
            style={{ backgroundColor: getThemeColor(TINTS[iconTint], isDark) }}
          >
            <IconifyIcon
              name={icon}
              size={20}
              color={getThemeColor(TINT_FOREGROUND[iconTint], isDark)}
            />
          </View>
        ) : null)}

      <View className="flex-1 min-w-0">
        <Text numberOfLines={1} className="text-base text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} className="text-sm text-muted mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? <Text className="text-sm text-muted">{value}</Text> : null}

      {switchValue !== undefined && onSwitchChange ? (
        <Switch
          isSelected={switchValue}
          onSelectedChange={onSwitchChange}
          accessibilityLabel={accessibilityLabel ?? title}
        />
      ) : (
        trailing
      )}

      {showChevron ? (
        <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
      ) : null}
    </>
  );

  const rowClass = `flex-row items-center gap-3 px-4 py-3.5 bg-surface rounded-card ${className}`;

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        className={rowClass}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        testID={testID}
      >
        {content}
      </PressableScale>
    );
  }

  return (
    <View className={rowClass} testID={testID}>
      {content}
    </View>
  );
}

/** Group of rows in one card (settings sections). */
export function ListGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`gap-2 ${className}`}>{children}</View>;
}

export default ListRow;
