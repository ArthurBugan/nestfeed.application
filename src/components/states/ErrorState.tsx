import { View } from 'react-native';
import { Alert, Button } from 'heroui-native';

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
            onPress={onRetry}
            accessibilityLabel={retryLabel}
          >
            {retryLabel}
          </Button>
        )}
      </Alert>
    </View>
  );
}

export default ErrorState;
