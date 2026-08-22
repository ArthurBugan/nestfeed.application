import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';

// The state presets read `reduceMotion` from the theme context.
jest.mock('@/theme/ThemeProvider', () => {
  const React = require('react');
  const state = { isDark: false, reduceMotion: false };
  return {
    __setThemeState: (next: Record<string, unknown>) => Object.assign(state, next),
    useTheme: () => state,
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement('View', null, children),
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { __setThemeState }: any = require('@/theme/ThemeProvider');

beforeEach(() => {
  __setThemeState({ isDark: false, reduceMotion: false });
});

describe('EmptyState (Track D, spec #001)', () => {
  it('renders title, description and an accessible CTA', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        icon="lucide:tv"
        title="No channels yet"
        description="Add a channel to start."
        actionLabel="New Channel"
        onAction={onAction}
      />
    );
    expect(screen.getByText('No channels yet')).toBeTruthy();
    expect(screen.getByText('Add a channel to start.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('New Channel'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('exposes an accessible summary of the empty state', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByLabelText('Nothing here')).toBeTruthy();
  });
});

describe('ErrorState (Track D, spec #001)', () => {
  it('renders error copy and fires retry', () => {
    const onRetry = jest.fn();
    render(
      <ErrorState
        title="Couldn't load"
        message="Network hiccup."
        onRetry={onRetry}
        retryLabel="Retry now"
      />
    );
    expect(screen.getByText("Couldn't load")).toBeTruthy();
    expect(screen.getByText('Network hiccup.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Retry now'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('falls back to default copy without a retry handler', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.queryByLabelText('Retry')).toBeNull();
  });
});

describe('LoadingState (Track D, spec #001)', () => {
  it('announces loading for screen readers (spinner variant)', () => {
    render(<LoadingState label="Loading groups" />);
    expect(screen.getByLabelText('Loading groups')).toBeTruthy();
  });

  it('announces loading for screen readers (skeleton variant)', () => {
    render(<LoadingState variant="skeleton" rows={3} label="Loading channels" />);
    expect(screen.getByLabelText('Loading channels')).toBeTruthy();
  });

  it('renders static skeletons when Reduce Motion is on (FR-F3)', () => {
    __setThemeState({ reduceMotion: true });
    const { UNSAFE_getAllByProps } = render(
      <LoadingState variant="skeleton" rows={2} />
    );
    // All text placeholders render with the animation-free variant.
    const statics = UNSAFE_getAllByProps({ variant: 'none' });
    expect(statics.length).toBeGreaterThanOrEqual(4);
    statics.forEach((el) => expect(el.props.variant).toBe('none'));
  });

  it('disables spinner animation when Reduce Motion is on (FR-F3)', () => {
    __setThemeState({ reduceMotion: true });
    const { UNSAFE_getAllByProps } = render(<LoadingState />);
    expect(UNSAFE_getAllByProps({ animation: 'disabled' }).length).toBeGreaterThan(0);
  });
});
