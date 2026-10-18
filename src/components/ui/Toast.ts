/**
 * Toast surface (spec 005, FR-P9): one notification API for the app.
 *
 * Screen-level feedback uses this; `Alert.alert` is reserved for
 * destructive confirmations. Backed by `burnt` (already a dependency).
 */

import { toast } from 'burnt';

export const Toast = {
  success: (message: string) =>
    toast({ title: message, duration: 2.5, preset: 'done' }),
  error: (message: string) =>
    toast({ title: message, duration: 3, preset: 'error' }),
  info: (message: string) =>
    toast({ title: message, duration: 2.5, preset: 'none' }),
};

export default Toast;
