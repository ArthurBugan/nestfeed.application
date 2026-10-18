import { forwardRef, type ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from './usePressAnimation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  /** Scale target while pressed (default 0.97). */
  scaleTo?: number;
  /** Fire the light haptic tick on press (default true). */
  haptic?: boolean;
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
}

/**
 * Pressable with spring press-scale + haptic feedback (spec 005, P5).
 * Passes all RN Pressable props through (accessibility, hitSlop…).
 */
export const PressableScale = forwardRef<typeof Pressable, PressableScaleProps>(
  function PressableScale({ scaleTo, haptic = true, style, children, onPress, ...rest }, ref) {
    const { animatedStyle, onPressIn, onPressOut, onPress: hapticPress } =
      usePressAnimation({ scaleTo, haptic });

    return (
      <AnimatedPressable
        ref={ref as never}
        onPress={(event) => {
          hapticPress();
          onPress?.(event);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[animatedStyle, style]}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }
);

export default PressableScale;
