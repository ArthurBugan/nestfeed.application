import { type ReactNode } from 'react';
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

export interface ScreenProps {
  children: ReactNode;
  /** Extra classes for the scroll content container. */
  className?: string;
  /** Which safe-area edges to pad (default: bottom only; headers handle top). */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Wrap children in a ScrollView. */
  scroll?: boolean;
  /** Pull-to-refresh support (implies scroll). */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Horizontal padding of the content container (default px-5 rhythm). */
  padded?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Unified screen shell (spec 005, FR-P1): one safe-area pattern for the
 * whole app, themed background, optional scroll + pull-to-refresh.
 */
export function Screen({
  children,
  className = '',
  edges = ['bottom'],
  scroll = false,
  refreshing,
  onRefresh,
  padded = true,
  contentContainerStyle,
  testID,
}: ScreenProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Plain View root with explicit flex + per-edge inset padding. A
  // SafeAreaView root collapses to a zero-height (unpainted) subtree when it
  // is mounted directly inside the native tab content host.
  const edgePadding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const body = scroll ? (
    <ScrollView
      className={`flex-1 ${padded ? 'px-5' : ''} ${className}`}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={getThemeColor('accent', isDark)}
            colors={[getThemeColor('accent', isDark)]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-5' : ''} ${className}`} style={contentContainerStyle}>
      {children}
    </View>
  );

  return (
    <View className="bg-background" style={[{ flex: 1 }, edgePadding]} testID={testID}>
      {body}
    </View>
  );
}

export default Screen;
