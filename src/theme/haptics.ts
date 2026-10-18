/**
 * Haptics helpers (spec 005, principle P5).
 *
 * Haptics are tactile feedback, not motion: they follow their own toggle
 * (independent of reduce-motion) and never throw on unsupported devices.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let userEnabled = true;

/** Wire to the device haptics preference (defaults on). */
export function setHapticsEnabled(enabled: boolean) {
  userEnabled = enabled;
}

const safe = async (work: () => Promise<void>) => {
  if (!userEnabled) return;
  try {
    await work();
  } catch {
    // Haptics are best-effort; ignore unsupported devices / simulators.
  }
};

/** Light tick for selections, toggles, tab changes. */
export const tap = () =>
  safe(() =>
    Platform.OS === 'ios'
      ? Haptics.selectionAsync()
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  );

/** Physical impact for primary confirmations. */
export const impact = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Success/failure notification pattern. */
export const notify = (type: 'success' | 'warning' | 'error' = 'success') =>
  safe(() =>
    Haptics.notificationAsync(
      type === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : type === 'warning'
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error
    )
  );
