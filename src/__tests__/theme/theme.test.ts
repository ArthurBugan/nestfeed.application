import { colors, statusColors, categoryColors, shadows, borderRadius } from '../../theme/colors';
import { themeColors, getThemeColor, ThemeColorKey } from '../../theme/themeColors';

describe('Theme', () => {
  describe('colors', () => {
    it('should have light and dark schemes', () => {
      expect(colors).toHaveProperty('light');
      expect(colors).toHaveProperty('dark');
    });

    it('should have consistent structure for both schemes', () => {
      const lightKeys = Object.keys(colors.light);
      const darkKeys = Object.keys(colors.dark);
      
      expect(lightKeys).toEqual(darkKeys);
    });

    it('should have all expected color keys', () => {
      const expectedKeys = ['background', 'foreground', 'card', 'primary', 'secondary', 'muted', 'accent', 'destructive', 'border', 'input', 'ring'];
      expectedKeys.forEach((key) => {
        expect(colors.light).toHaveProperty(key);
        expect(colors.dark).toHaveProperty(key);
      });
    });

    it('should have gradient colors', () => {
      expect(colors.gradient).toBeDefined();
      expect(colors.gradient.start).toBeDefined();
      expect(colors.gradient.end).toBeDefined();
    });
  });

  describe('statusColors', () => {
    it('should have all status colors', () => {
      expect(statusColors.success).toBe('#22c55e');
      expect(statusColors.warning).toBe('#f59e0b');
      expect(statusColors.error).toBe('#dc2626');
      expect(statusColors.info).toBe('#3b82f6');
    });
  });

  describe('categoryColors', () => {
    it('should have all category colors', () => {
      expect(categoryColors.entertainment).toBe('#ef4444');
      expect(categoryColors.gaming).toBe('#8b5cf6');
      expect(categoryColors.education).toBe('#3b82f6');
      expect(categoryColors.tech).toBe('#10b981');
      expect(categoryColors.music).toBe('#f59e0b');
      expect(categoryColors.news).toBe('#6366f1');
      expect(categoryColors.sports).toBe('#14b8a6');
      expect(categoryColors.lifestyle).toBe('#ec4899');
    });
  });

  describe('shadows', () => {
    it('should have all shadow sizes', () => {
      expect(shadows.sm).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.lg).toBeDefined();
    });

    it('should have shadow properties', () => {
      expect(shadows.sm.shadowColor).toBeDefined();
      expect(shadows.sm.shadowOffset).toBeDefined();
      expect(shadows.sm.shadowOpacity).toBeDefined();
      expect(shadows.sm.shadowRadius).toBeDefined();
      expect(shadows.sm.elevation).toBeDefined();
    });
  });

  describe('borderRadius', () => {
    it('should have all border radius sizes', () => {
      expect(borderRadius.sm).toBe(6);
      expect(borderRadius.default).toBe(10);
      expect(borderRadius.md).toBe(12);
      expect(borderRadius.lg).toBe(16);
      expect(borderRadius.xl).toBe(20);
      expect(borderRadius.full).toBe(9999);
    });
  });

  describe('themeColors', () => {
    it('should export theme colors', () => {
      expect(themeColors).toBeDefined();
    });

    it('returns a defined string for every token in light and dark mode', () => {
      Object.keys(themeColors.light).forEach((key) => {
        const light = getThemeColor(key as ThemeColorKey, false);
        const dark = getThemeColor(key as ThemeColorKey, true);
        expect(typeof light).toBe('string');
        expect(light).not.toBeNull();
        expect(typeof dark).toBe('string');
        expect(dark).not.toBeNull();
      });
    });

    it('defines field background + placeholder tokens (regression for #001)', () => {
      ['field-background', 'field-placeholder'].forEach((key) => {
        expect(getThemeColor(key as ThemeColorKey, false)).toMatch(/^hsl\(/);
        expect(getThemeColor(key as ThemeColorKey, true)).toMatch(/^hsl\(/);
      });
    });

    it('light and dark token sets are identical', () => {
      expect(Object.keys(themeColors.light).sort()).toEqual(
        Object.keys(themeColors.dark).sort()
      );
    });
  });
});
