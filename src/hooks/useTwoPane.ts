import { useWindowDimensions } from 'react-native';

/** Minimum window width (pt) at which master-detail layouts switch on. */
export const TWO_PANE_MIN_WIDTH = 900;

/**
 * Spec 008 FR-A2: Groups/Channels tabs render a two-pane master-detail
 * layout when the window is wide enough (iPad split view / landscape).
 * iPhone windows never reach this width, so iPhone layout is unchanged.
 */
export function useTwoPane(): boolean {
  const { width } = useWindowDimensions();
  return width >= TWO_PANE_MIN_WIDTH;
}
