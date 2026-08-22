import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/Input';

// Precise heroui-native mocks: Input maps to a real RN TextInput so keyboard
// props and events can be asserted; the compound field parts render children.
jest.mock('heroui-native', () => {
  const RN = require('react-native');
  const ReactLib = require('react');
  return {
    TextField: ({ children }: { children: React.ReactNode }) => (
      <RN.View>{children}</RN.View>
    ),
    Label: ({ children }: { children: React.ReactNode }) => (
      <RN.Text>{children}</RN.Text>
    ),
    FieldError: ({ children }: { children: React.ReactNode }) => (
      <RN.Text accessibilityRole="alert">{children}</RN.Text>
    ),
    Input: ReactLib.forwardRef((props: Record<string, unknown>, ref: unknown) => (
      <RN.TextInput {...props} ref={ref} />
    )),
  };
});

// Isolate from the theme provider stack: the component only needs `isDark`.
jest.mock('@/theme/ThemeProvider', () => {
  const React = require('react');
  return {
    useTheme: () => ({ isDark: false, reduceMotion: false }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement('View', null, children),
  };
});

describe('Input component (Track C, spec #001)', () => {
  it('renders label and a distinct error state (FR-C1)', () => {
    render(
      <Input
        label="Email"
        value="a@b.com"
        onChangeText={() => {}}
        error="Invalid email"
      />
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('toggles password visibility with an accessible toggle + haptics (FR-C2)', () => {
    const Haptics = require('expo-haptics');
    render(
      <Input
        label="Password"
        value=""
        onChangeText={() => {}}
        secureTextEntry
      />
    );
    const show = screen.getByLabelText('Show password');
    fireEvent.press(show);
    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(screen.getByLabelText('Hide password')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Hide password'));
    expect(screen.getByLabelText('Show password')).toBeTruthy();
  });

  it('forwards keyboard props to the native input (FR-C2)', () => {
    const onSubmit = jest.fn();
    render(
      <Input
        label="Name"
        value=""
        onChangeText={() => {}}
        returnKeyType="next"
        onSubmitEditing={onSubmit}
      />
    );
    const input = screen.getByDisplayValue('');
    expect(input.props.returnKeyType).toBe('next');
    fireEvent(input, 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('resolves the placeholder color from the field-placeholder token (FR-A2)', () => {
    render(<Input value="" onChangeText={() => {}} placeholder="Search" />);
    const input = screen.getByPlaceholderText('Search');
    expect(input.props.placeholderTextColor).toMatch(/^hsl\(/);
  });

  it('announces the field name for screen readers (FR-F1)', () => {
    render(<Input label="Name" value="" onChangeText={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeTruthy();
  });
});
