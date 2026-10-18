import { forwardRef, type ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

export interface SearchFieldProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Leading icon (default 'lucide:search'). */
  icon?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
  rightElement?: ReactNode;
}

/**
 * The one search field (spec 005, FR-P4): fills surface, rounded control,
 * search icon, themed placeholder. Replaces the three competing treatments.
 */
export const SearchField = forwardRef<React.ElementRef<typeof TextInput>, SearchFieldProps>(function SearchField(
  {
    value,
    onChangeText,
    placeholder = 'Search',
    icon = 'lucide:search',
    className = '',
    style,
    label,
    rightElement,
    ...rest
  },
  ref
) {
  const { isDark } = useTheme();

  return (
    <View className={className}>
      {label ? <Text className="text-sm text-muted mb-1.5">{label}</Text> : null}
      <View
        className="flex-row items-center gap-2.5 bg-surface rounded-xl px-3.5 h-12 border border-border/60"
        style={style}
      >
        <IconifyIcon name={icon} size={18} color={getThemeColor('muted', isDark)} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={getThemeColor('field-placeholder', isDark)}
          className="flex-1 text-base text-foreground"
          style={{ fontSize: 16 }}
          accessibilityLabel={label ?? placeholder}
          returnKeyType="search"
          {...rest}
        />
        {rightElement}
      </View>
    </View>
  );
});

export default SearchField;
