import { View } from 'react-native';
import { IconifyIcon as IconifyIconComponent } from '@huymobile/react-native-iconify';
import { useThemeColor } from 'heroui-native/hooks';

const colorClassToToken: Record<string, string> = {
  'text-foreground': 'foreground',
  'text-muted': 'muted',
  'text-accent': 'accent',
  'text-accent-foreground': 'accentForeground',
  'text-danger': 'danger',
  'surface-secondary': 'surfaceSecondary',
};

interface IconifyIconProps {
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
  const resolvedColor = useThemeColor(token || 'foreground');

  const color = explicitColor || (token ? resolvedColor : undefined);
  const icon = <IconifyIconComponent name={name} size={size} color={color} />;

  if (spacingClasses) {
    return <View className={spacingClasses}>{icon}</View>;
  }

  return icon;
}

export default IconifyIcon;
