import { type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { IconifyIcon, type IconifyIconProps } from '@/components/IconifyIcon';
import { PressableScale } from './PressableScale';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'flat' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Leading icon (iconify name, e.g. 'lucide:plus'). */
  icon?: IconifyIconProps['name'];
  className?: string;
  accessibilityLabel?: string;
  testID?: string;
}

const CONTAINER = {
  // min-height + vertical padding so labels can grow with Dynamic Type at
  // accessibility content sizes instead of clipping (spec 008 FR-A1).
  sm: 'min-h-10 px-4 py-2 rounded-xl',
  md: 'min-h-12 px-5 py-2.5 rounded-xl',
  lg: 'min-h-14 px-6 py-3 rounded-2xl',
} as const;

const LABEL = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

const VARIANTS = {
  primary: 'bg-accent',
  flat: 'bg-default',
  outline: 'bg-transparent border border-field-border',
  danger: 'bg-danger',
  ghost: 'bg-transparent',
} as const;

const LABEL_COLORS = {
  primary: 'text-accent-foreground',
  flat: 'text-default-foreground',
  outline: 'text-foreground',
  danger: 'text-danger-foreground',
  ghost: 'text-foreground',
} as const;

/**
 * The app's button (spec 005, FR-P3): spring press-scale + haptic tick,
 * consistent variants/sizes, loading state. Replaces raw TouchableOpacity
 * CTAs and ad-hoc heroui Button usage.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center gap-2 ${CONTAINER[size]} ${
        VARIANTS[variant]
      } ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : icon ? (
        <IconifyIcon name={icon} size={size === 'sm' ? 16 : 18} />
      ) : null}
      {label ? (
        <Text
          className={`font-semibold ${LABEL[size]} ${LABEL_COLORS[variant]}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </PressableScale>
  );
}

/** Icon-only round action button (back buttons, card actions). */
export function IconButton({
  name,
  onPress,
  label,
  size = 40,
  iconSize,
  variant = 'surface',
  className = '',
}: {
  name: IconifyIconProps['name'];
  onPress: () => void;
  label: string;
  size?: number;
  iconSize?: number;
  variant?: 'surface' | 'ghost' | 'accent';
  className?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`rounded-full items-center justify-center ${
        variant === 'surface'
          ? 'bg-surface'
          : variant === 'accent'
            ? 'bg-accent'
            : 'bg-transparent'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <IconifyIcon name={name} size={iconSize ?? Math.round(size * 0.45)} />
    </PressableScale>
  );
}

/** Inline chip used for quick actions and filters. */
export function Chip({
  label,
  onPress,
  selected = false,
  icon,
  className = '',
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  icon?: IconifyIconProps['name'];
  className?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-1.5 px-3.5 min-h-11 py-2 rounded-full border ${
        selected ? 'bg-accent border-accent' : 'bg-surface border-field-border'
      } ${className}`}
    >
      {icon ? <IconifyIcon name={icon} size={15} /> : null}
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-accent-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export default Button;