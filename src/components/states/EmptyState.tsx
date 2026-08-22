import { View, Text } from 'react-native';
import { Button } from 'heroui-native';
import { IconifyIcon } from '@/components/IconifyIcon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = 'lucide:inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`py-16 px-6 items-center ${className}`} accessible accessibilityRole="text" accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}>
      <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4 bg-default">
        <IconifyIcon name={icon} size={32} className="text-muted" />
      </View>
      <Text className="text-base font-medium text-foreground text-center">{title}</Text>
      {description && (
        <Text className="text-sm text-muted text-center mt-1">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="primary"
          onPress={onAction}
          className="mt-4"
          accessibilityLabel={actionLabel}
        >
          <Text>{actionLabel}</Text>
        </Button>
      )}
    </View>
  );
}

export default EmptyState;
