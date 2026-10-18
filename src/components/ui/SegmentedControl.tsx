import { Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { tap } from '@/theme/haptics';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented control (spec 005, FR-P7): pressed-spring feedback, haptic tick
 * on change, elevated selected pill. Generic over the value union.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <View
      className={`flex-row bg-default rounded-xl p-1 ${className}`}
      accessible
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => {
              if (!selected) {
                tap();
                onChange(option.value);
              }
            }}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            className={`flex-1 flex-row items-center justify-center gap-1.5 h-9 rounded-lg ${
              selected ? 'bg-surface' : ''
            }`}
            style={
              selected
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                    elevation: 1,
                  }
                : undefined
            }
          >
            {option.icon ? <Text className="text-sm">{option.icon}</Text> : null}
            <Text
              numberOfLines={1}
              className={`text-sm font-medium ${
                selected ? 'text-foreground' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
