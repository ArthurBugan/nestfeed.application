/**
 * Motion tokens (spec 005, principle P4/P11).
 *
 * All animation in the app routes through these presets so motion stays
 * consistent and fully silenced by the user's reduce-motion preference.
 */

import { Easing, type EasingFunction } from 'react-native';

export const springs = {
  /** Buttons, toggles, press feedback — quick and precise. */
  snappy: { damping: 18, stiffness: 220, mass: 0.9 },
  /** Sheets, headers, cards — noticeable but calm. */
  gentle: { damping: 26, stiffness: 140, mass: 1 },
  /** Playful accents (empty state, success) — slight overshoot. */
  bouncy: { damping: 12, stiffness: 260, mass: 0.8 },
} as const;

export const durations = {
  instant: 100,
  fast: 160,
  normal: 240,
  slow: 360,
} as const;

export const easings: Record<'standard' | 'decelerate' | 'accelerate', EasingFunction> = {
  standard: Easing.out(Easing.cubic),
  decelerate: Easing.out(Easing.quad),
  accelerate: Easing.in(Easing.quad),
};

/**
 * Timing preset that respects reduce-motion: when enabled, animations
 * resolve immediately (duration 0) instead of playing.
 */
export function timing(duration: keyof typeof durations | number, reduceMotion: boolean) {
  return {
    duration: reduceMotion ? 0 : typeof duration === 'number' ? duration : durations[duration],
    easing: easings.standard,
  };
}

export const motion = { springs, durations, easings, timing } as const;
