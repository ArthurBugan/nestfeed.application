import { type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { IconifyIcon } from '@/components/IconifyIcon';

/**
 * Right-hand master-detail pane (spec 008 FR-A2): renders the selected
 * row's overview inline instead of pushing a screen. Shows a neutral
 * placeholder when nothing is selected yet.
 */
export function DetailPane({
  selected,
  placeholder,
  children,
  className = '',
}: {
  selected: boolean;
  placeholder: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`h-full bg-surface border border-border rounded-3xl overflow-hidden ${className}`}
    >
      {selected ? (
        children
      ) : (
        <View className="flex-1 items-center justify-center gap-2 p-6">
          <IconifyIcon name="lucide:panel-right" size={28} />
          <Text className="text-sm text-muted text-center">{placeholder}</Text>
        </View>
      )}
    </View>
  );
}

export default DetailPane;
