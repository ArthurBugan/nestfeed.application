import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export interface CardProps {
  children: ReactNode;
  /** `elevated` (default) uses surface + shadow; `filled` uses surface-secondary; `glass` adds translucency. */
  variant?: 'elevated' | 'filled' | 'outline';
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const VARIANTS = {
  elevated: 'bg-surface',
  filled: 'bg-surface-secondary',
  outline: 'bg-surface border border-border',
} as const;

/**
 * Surface container (spec 005, P1/P2): continuous corners, elevation,
 * consistent radius. Replaces inline `rounded-2xl + shadows.md` blocks.
 */
export function Card({
  children,
  variant = 'elevated',
  className = '',
  style,
}: CardProps) {
  return (
    <View
      className={`rounded-card p-4 ${VARIANTS[variant]} ${className}`}
      style={[
        variant === 'elevated' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
