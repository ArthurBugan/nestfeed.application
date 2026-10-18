import { useCallback, useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springs, durations } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { tap } from '@/theme/haptics';

/**
 * Press feedback for any touchable (spec 005, P4/P5): a spring scale-down on
 * press-in with a light haptic tick. Honors reduce-motion by skipping the
 * animation (haptics still fire — they are tactile, not motion).
 */
export function usePressAnimation(options?: { scaleTo?: number; haptic?: boolean }) {
  const scaleTo = options?.scaleTo ?? 0.97;
  const withHaptic = options?.haptic ?? true;
  const { reduceMotion } = useTheme();
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(scaleTo, springs.snappy);
  }, [reduceMotion, scale, scaleTo]);

  const onPressOut = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(1, springs.snappy);
  }, [reduceMotion, scale]);

  const onPress = useCallback(() => {
    if (withHaptic) tap();
  }, [withHaptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut, onPress };
}

/** Linear fade/scale entrance used for lists and empty states. */
export function useEntranceAnimation(delay = 0) {
  const { reduceMotion } = useTheme();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  useEffect(() => {
    progress.value = withDelay(
      reduceMotion ? 0 : delay,
      withTiming(1, { duration: reduceMotion ? 0 : durations.normal })
    );
  }, [progress, reduceMotion, delay]);

  return { animatedStyle, delay };
}
