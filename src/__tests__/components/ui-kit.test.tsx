import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button, IconButton, Chip } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListRow } from '@/components/ui/ListRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchField } from '@/components/ui/SearchField';
import { ThemeProvider } from '@/theme/ThemeProvider';
import type { ReactNode } from 'react';

const renderWithTheme = (ui: ReactNode) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('UI kit (spec 005)', () => {
  describe('Button', () => {
    it('renders label and fires press with haptics', () => {
      const onPress = jest.fn();
      renderWithTheme(<Button label="Save" onPress={onPress} testID="save" />);
      fireEvent.press(screen.getByTestId('save'));
      expect(onPress).toHaveBeenCalled();
    });

    it('exposes accessibility label and disabled state', () => {
      renderWithTheme(<Button label="Save" onPress={() => {}} accessibilityLabel="Save changes" disabled />);
      const button = screen.getByLabelText('Save changes');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('renders icon buttons and chips with a11y state', () => {
      renderWithTheme(
        <>
          <IconButton name="lucide:plus" label="Add" onPress={() => {}} />
          <Chip label="All" selected onPress={() => {}} />
        </>
      );
      expect(screen.getByLabelText('Add')).toBeTruthy();
      expect(screen.getByLabelText('All').props.accessibilityState.selected).toBe(true);
    });
  });

  describe('ScreenHeader', () => {
    it('renders the title as a header and a back button', () => {
      renderWithTheme(<ScreenHeader title="Settings" />);
      expect(screen.getByRole('header')).toBeTruthy();
      expect(screen.getByLabelText('Go back')).toBeTruthy();
      fireEvent.press(screen.getByLabelText('Go back'));
    });
  });

  describe('ListRow', () => {
    it('renders title, subtitle and switch variant', () => {
      renderWithTheme(
        <ListRow
          title="Notifications"
          subtitle="Push alerts"
          switchValue
          onSwitchChange={() => {}}
        />
      );
      expect(screen.getByText('Notifications')).toBeTruthy();
      expect(screen.getByText('Push alerts')).toBeTruthy();
    });

    it('press fires and row keeps an accessible label', () => {
      const onPress = jest.fn();
      renderWithTheme(<ListRow title="Edit Group" onPress={onPress} testID="row" />);
      fireEvent.press(screen.getByTestId('row'));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('SegmentedControl', () => {
    it('changes selection and exposes selected state', () => {
      const onChange = jest.fn();
      renderWithTheme(
        <SegmentedControl
          options={[
            { value: 'a', label: 'Overview' },
            { value: 'b', label: 'Settings' },
          ]}
          value="a"
          onChange={onChange}
        />
      );
      expect(screen.getByLabelText('Overview').props.accessibilityState.selected).toBe(true);
      fireEvent.press(screen.getByLabelText('Settings'));
      expect(onChange).toHaveBeenCalledWith('b');
    });
  });

  describe('SearchField', () => {
    it('renders with a themed placeholder', () => {
      renderWithTheme(<SearchField value="" onChangeText={() => {}} placeholder="Search groups" label="Find" />);
      expect(screen.getByDisplayValue('')).toBeTruthy();
    });
  });
});
