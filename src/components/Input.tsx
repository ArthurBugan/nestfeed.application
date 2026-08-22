import { Pressable, View } from 'react-native';
import { TextField, Input as HeroInput, Label, FieldError } from 'heroui-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  /** Platform autofill hint, e.g. 'email' | 'password' | 'new-password' | 'one-time-code'. */
  autoComplete?: string;
  textContentType?: 'none' | 'emailAddress' | 'password' | 'newPassword' | 'username' | 'oneTimeCode';
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
  placeholderTextColor,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  autoComplete = 'off',
  textContentType,
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

  const togglePassword = () => {
    Haptics.selectionAsync();
    setShowPassword((visible) => !visible);
  };

  return (
    <TextField isInvalid={!!error} isDisabled={!editable} className="mb-4">
      {label && <Label>{label}</Label>}
      <View className="w-full">
        <HeroInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor ?? getThemeColor('field-placeholder', isDark)}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          textContentType={textContentType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={editable}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          autoFocus={autoFocus}
          accessibilityLabel={label ?? placeholder}
          className={`w-full rounded-xl text-foreground ${
            secureTextEntry ? 'pr-12' : ''
          } ${multiline ? 'min-h-[80px]' : ''} ${className}`}
          style={{ fontSize: multiline ? 15 : 16 }}
        />
        {secureTextEntry && (
          <Pressable
            onPress={togglePassword}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-3"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityState={{ expanded: showPassword }}
          >
            <IconifyIcon
              name={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
              size={20}
              color={getThemeColor('muted', isDark)}
            />
          </Pressable>
        )}
        {!secureTextEntry && rightElement && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</View>
        )}
      </View>
      {!!error && (
        <FieldError className="ml-1">{error}</FieldError>
      )}
    </TextField>
  );
}

export default Input;
