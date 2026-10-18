import { springs, durations, easings, timing, motion } from '../../theme/motion';

describe('motion tokens', () => {
  it('exposes spring presets ordered by energy', () => {
    expect(springs.snappy.stiffness).toBeGreaterThan(springs.gentle.stiffness);
    expect(springs.bouncy.damping).toBeLessThan(springs.snappy.damping);
  });

  it('exposes increasing durations', () => {
    expect(durations.instant).toBeLessThan(durations.fast);
    expect(durations.fast).toBeLessThan(durations.normal);
    expect(durations.normal).toBeLessThan(durations.slow);
  });

  it('timing() collapses to 0 duration when reduceMotion is on', () => {
    expect(timing('normal', false).duration).toBe(durations.normal);
    expect(timing('normal', true).duration).toBe(0);
    expect(timing(120, false).duration).toBe(120);
  });

  it('exposes an easings map with all entries defined', () => {
    expect(typeof easings.standard).toBe('function');
    expect(typeof easings.decelerate).toBe('function');
    expect(typeof easings.accelerate).toBe('function');
    expect(motion).toBeDefined();
  });
});
