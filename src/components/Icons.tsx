import { Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const icons: Record<string, string> = {
  home: '🏠',
  users: '👥',
  tv: '📺',
  film: '🎬',
  globe: '🌐',
  link: '🔗',
  book: '📚',
  settings: '⚙️',
  plus: '➕',
  edit: '✏️',
  trash: '🗑️',
  share: '📤',
  star: '⭐',
  check: '✓',
  x: '✕',
  chevronRight: '›',
  chevronLeft: '‹',
  arrowLeft: '←',
  arrowRight: '→',
  search: '🔍',
  bell: '🔔',
  mail: '📧',
  lock: '🔒',
  eye: '👁️',
  user: '👤',
  calendar: '📅',
  clock: '🕐',
  heart: '❤️',
  staro: '⭐',
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  upload: '📤',
  download: '📥',
  copy: '📋',
  moreVertical: '⋮',
  moreHorizontal: '⋯',
  menu: '☰',
  close: '✕',
  checkCircle: '✅',
  alertCircle: '⚠️',
  info: 'ℹ️',
  help: '❓',
};

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <Text style={{ fontSize: size }} className={className}>
      {icons[name] || '•'}
    </Text>
  );
}

export default Icon;