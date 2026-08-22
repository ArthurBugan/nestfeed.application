import { View, Text } from 'react-native';
import { Skeleton, Spinner } from 'heroui-native';
import { useTheme } from '@/theme/ThemeProvider';

interface LoadingStateProps {
  /** `skeleton` renders list-row placeholders; `spinner` renders a centered spinner. */
  variant?: 'skeleton' | 'spinner';
  /** Number of skeleton rows (skeleton variant only). */
  rows?: number;
  /** Announced by screen readers while content loads. */
  label?: string;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  rows = 5,
  label = 'Loading',
  className = '',
}: LoadingStateProps) {
  const { reduceMotion } = useTheme();

  if (variant === 'spinner') {
    return (
      <View
        className={`py-16 items-center ${className}`}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
      >
        <Spinner animation={reduceMotion ? 'disabled' : undefined} />
        <Text className="text-sm text-muted mt-3">{label}...</Text>
      </View>
    );
  }

  return (
    <View
      className={`px-4 gap-2 ${className}`}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} className="bg-surface rounded-xl p-3.5 flex-row items-center gap-3">
          <Skeleton
            width={44}
            height={44}
            className="rounded-xl"
            variant={reduceMotion ? 'none' : 'shimmer'}
          />
          <View className="flex-1 gap-2">
            <Skeleton
              height={16}
              className="w-3/4 rounded-lg"
              variant={reduceMotion ? 'none' : 'shimmer'}
            />
            <Skeleton
              height={12}
              className="w-1/2 rounded-lg"
              variant={reduceMotion ? 'none' : 'shimmer'}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default LoadingState;
