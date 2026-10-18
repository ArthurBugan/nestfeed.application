import { View } from 'react-native';
import { IconifyIcon as IconifyIconComponent } from '@huymobile/react-native-iconify';
import { useThemeColor } from 'heroui-native/hooks';

// `useThemeColor` reads `--color-<name>`, so keys map to kebab-case token
// names (NOT camelCase — `--color-accentForeground` doesn't exist).
const colorClassToToken: Record<string, string> = {
  'text-foreground': 'foreground',
  'text-muted': 'muted',
  'text-accent': 'accent',
  'text-accent-foreground': 'accent-foreground',
  'text-danger': 'danger',
  'surface-secondary': 'surface-secondary',
};

export interface IconifyIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function IconifyIcon({ name, size = 24, color: explicitColor, className }: IconifyIconProps) {
  const classes = (className || '').split(' ').filter(Boolean);

  const colorClass = classes.find((c) => colorClassToToken[c]);
  const spacingClasses = classes.filter((c) => !colorClassToToken[c]).join(' ');

  const token = colorClass ? colorClassToToken[colorClass] : null;
  const resolvedColor = useThemeColor((token || 'foreground') as never);

  // Always resolve to a token color (foreground by default) so icons never
  // fall back to the library's own default, which ignores the app theme.
  const color = explicitColor || resolvedColor;
  const icon = <IconifyIconComponent name={name} size={size} color={color} />;

  if (spacingClasses) {
    return <View className={spacingClasses}>{icon}</View>;
  }

  return icon;
}

export default IconifyIcon;
