import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, View, type TextInput, type TextInputProps } from 'react-native';
import { TextField, Input as HeroInput, Label, FieldError } from 'heroui-native';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';

type HeroInputHandle = { focus: () => void; blur: () => void };

export interface InputHandle {
  focus: () => void;
  blur: () => void;
}

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
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: 'none' | 'emailAddress' | 'password' | 'newPassword' | 'username' | 'oneTimeCode';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  className?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  autoFocus?: boolean;
  /** E2E hooks (Maestro `tapOn: id`). */
  testID?: string;
  rightElement?: React.ReactNode;
  /** Leading icon inside the field (iconify name). */
  leftElement?: React.ReactNode;
}

/**
 * The app's text field (spec 005, FR-P4): label, error, password toggle,
 * side slots. Forwards a focus/blur handle to the underlying TextInput.
 */
export const Input = forwardRef<InputHandle, InputProps>(function Input(
  {
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
    testID,
    rightElement,
    leftElement,
  },
  ref
) {
  const { isDark } = useTheme();
  const inputRef = useRef<HeroInputHandle>(null);
  const [showPassword, setShowPassword] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  const togglePassword = () => {
    tap();
    setShowPassword((visible) => !visible);
  };

  return (
    <TextField isInvalid={!!error} isDisabled={!editable} className="mb-4">
      {label && <Label>{label}</Label>}
      <View className="w-full">
        {leftElement ? (
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">{leftElement}</View>
        ) : null}
        <HeroInput
          ref={inputRef as never}
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
          testID={testID}
          className={`w-full rounded-xl text-foreground ${
            secureTextEntry ? 'pr-12' : ''
          } ${leftElement ? 'pl-12' : ''} ${multiline ? 'min-h-[80px]' : ''} ${className}`}
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
});

export default Input;
