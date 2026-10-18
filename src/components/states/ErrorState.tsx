import { View } from 'react-native';
import { Alert } from 'heroui-native';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this content. Check your connection and try again.",
  onRetry,
  retryLabel = 'Retry',
  className = '',
}: ErrorStateProps) {
  return (
    <View className={`px-4 py-10 ${className}`}>
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{title}</Alert.Title>
          <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
        {onRetry && (
          <Button
            size="sm"
            variant="danger"
            label={retryLabel}
            onPress={onRetry}
            accessibilityLabel={retryLabel}
            className="mt-3 self-start"
          />
        )}
      </Alert>
    </View>
  );
}

export default ErrorState;
