import { View, Text, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Input as NativeInput } from 'heroui-native';
import { useState, useRef } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  className?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  className = '',
  onSubmitEditing,
  returnKeyType = 'done',
  autoFocus = false,
  rightElement,
}: InputProps) {
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const borderColor = error
    ? getThemeColor('danger', isDark)
    : isFocused
      ? getThemeColor('accent', isDark)
      : getThemeColor('border', isDark);

  // Solid background every mode (field-* tokens resolve in both light + dark).
  const fieldBg = getThemeColor('field-background', isDark);

  // Accessible label: associate the field with its label + any error so screen
  // readers announce a single meaningful value.
  const inputLabel = label
    ? error
      ? `${label}. Error: ${error}`
      : label
    : placeholder;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1.5">
          {label}
        </Text>
      )}
      <View
        accessibilityLabel={inputLabel}
        className={`rounded-2xl ${error ? 'border-danger' : isFocused ? 'border-accent' : 'border-border'}`}
        style={{
          backgroundColor: fieldBg,
        }}
      >
        <NativeInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={getThemeColor('field-placeholder', isDark)}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={editable}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={inputLabel}
          accessibilityHint={secureTextEntry ? 'Double tap to toggle password visibility' : undefined}
          className={`w-full px-4 py-3 text-foreground ${secureTextEntry ? 'pr-12' : ''} ${multiline ? 'min-h-[80px]' : 'min-h-[48px]'} ${!editable ? 'opacity-50' : ''} ${className}`}
          style={{ fontSize: multiline ? 15 : 16 }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={{ color: getThemeColor('muted', isDark) }}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        {rightElement && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </View>
        )}
      </View>
      {error && (
        <Text
          className="text-xs text-danger mt-1.5 ml-1"
          accessibilityLiveRegion="polite"
          accessibilityLabel={error}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export default Input;
