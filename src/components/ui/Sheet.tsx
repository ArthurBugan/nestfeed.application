import { useRef, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BottomSheet, type BottomSheetMethods } from '@expo/ui/community/bottom-sheet';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { alpha } from '@/theme/alpha';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sheet height snap points as percentages (default 65%). */
  snapPoints?: string[];
  title?: string;
}

/**
 * One bottom sheet (spec 005, FR-P8/P3): glass background, themed handle,
 * consistent radius. Wraps `@expo/ui`'s native sheet (gorhom-compatible API).
 */
export function Sheet({ open, onClose, children, snapPoints = ['65%'], title }: SheetProps) {
  const { isDark } = useTheme();
  const ref = useRef<BottomSheetMethods>(null);

  return (
    <BottomSheet
      ref={ref}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      onChange={(index: number) => {
        if (index < 0) onClose();
      }}
      backgroundStyle={{
        backgroundColor: alpha(getThemeColor('overlay', isDark), 0.98),
      }}
      handleIndicatorStyle={{ backgroundColor: getThemeColor('muted', isDark) }}
      enablePanDownToClose
    >
      <View className="px-5 pt-1 pb-8">
        {title ? (
          <Text accessibilityRole="header" className="text-xl font-bold text-foreground mb-3">
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </BottomSheet>
  );
}

export default Sheet;
