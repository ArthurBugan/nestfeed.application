import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/Input';

// Isolate from the theme provider stack: the component only needs `isDark`.
jest.mock('@/theme/ThemeProvider', () => {
  const React = require('react');
  return {
    useTheme: () => ({ isDark: false }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement('View', null, children),
  };
});

describe('Input component (Track C, spec #001)', () => {
  it('renders the error state text (distinct, labeled error)', () => {
    render(
      <Input
        label="Email"
        value="a@b.com"
        onChangeText={() => {}}
        error="Invalid email"
      />
    );
    // Error message is shown.
    expect(screen.getByText('Invalid email')).toBeTruthy();
    // Field's accessibility label combines the label + error for screen readers.
    expect(
      screen.getByLabelText('Email. Error: Invalid email')
    ).toBeTruthy();
  });

  it('toggles password visibility with an accessible toggle', () => {
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
    expect(screen.getByLabelText('Hide password')).toBeTruthy();
  });

  it('applies a focus ring on focus and the default border otherwise', () => {
    const { container } = render(
      <Input label="Name" value="" onChangeText={() => {}} />
    );
    // children[0] = root View (mb-4); children[1] = the bordered field wrapper.
    const wrapper = container.children[1] as any;
    expect(wrapper.props.className).toContain('border-border');

    // Focus the inner text input (first child of the wrapper).
    fireEvent.focus(wrapper.children[0]);

    const afterFocus = container.children[1] as any;
    expect(afterFocus.props.className).toContain('border-accent');
  });

  it('forwards keyboard props to the native input', () => {
    const onSubmit = jest.fn();
    const { container } = render(
      <Input
        label="Name"
        value=""
        onChangeText={() => {}}
        returnKeyType="next"
        onSubmitEditing={onSubmit}
      />
    );
    const input = container.children[1].children[0] as any;
    expect(input.props.returnKeyType).toBe('next');
    fireEvent.submit(input);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
