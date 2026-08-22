import { TouchableOpacity, View, Text } from 'react-native';
import { Input as TextInput } from 'heroui-native';
import { useState, useCallback, useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@expo/ui/community/bottom-sheet';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { Portal } from 'react-native-portalize';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
}

function OptionItem({ item, isSelected, onSelect, isDark }: { item: SelectOption; isSelected: boolean; onSelect: (value: string) => void; isDark: boolean }) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(item.value)}
      className="flex-row items-center gap-3 p-4 border-b"
      style={{ borderBottomColor: getThemeColor('border', isDark) }}
      activeOpacity={0.7}
      accessible
      accessibilityRole="option"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: getThemeColor('surface-secondary', isDark) }}
      >
        <IconifyIcon
          name={item.icon ? item.icon : 'lucide:folder'}
          size={18}
        />
      </View>
      <Text
        className={`flex-1 text-base ${isSelected ? 'text-accent font-medium' : 'text-foreground'}`}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {isSelected && (
        <IconifyIcon name="lucide:check" size={18} color={getThemeColor('accent', isDark)} />
      )}
    </TouchableOpacity>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  error,
}: SelectProps) {
  const { isDark } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(
    () =>
      searchTerm
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options,
    [options, searchTerm]
  );

  const handleSelect = useCallback(
    (itemValue: string) => {
      onChange(itemValue);
      setIsOpen(false);
      setIsExpanded(false);
      setSearchTerm('');
    },
    [onChange]
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setIsExpanded(true);
    setSearchTerm('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setSearchTerm('');
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setIsOpen(false);
      setIsExpanded(false);
      setSearchTerm('');
    }
  }, []);

  const bg = getThemeColor('background', isDark);
  const border = getThemeColor('border', isDark);
  const mutedFg = getThemeColor('muted-foreground', isDark);
  const emptyColor = getThemeColor('muted', isDark);

  // Accessible announced value: reads label + chosen option (or placeholder).
  const triggerLabel = selectedOption
    ? `${label || 'Selected option'}: ${selectedOption.label}`
    : `${label || 'Select'}: ${placeholder}. Opens selection.`;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>
      )}
      <TouchableOpacity
        onPress={open}
        className={`bg-field-background border rounded-xl px-4 py-3 flex-row items-center gap-3 ${
          error ? 'border-danger' : isExpanded ? 'border-accent' : 'border-border'
        }`}
        style={{ borderWidth: 1.5 }}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityState={{ expanded: isExpanded }}
      >
        {selectedOption?.icon && (
          <View className="w-6 h-6 items-center justify-center">
            <IconifyIcon name={selectedOption.icon} size={18} />
          </View>
        )}
        <Text className={`flex-1 ${selectedOption ? 'text-foreground' : 'text-muted'}`} numberOfLines={1}>
          {selectedOption?.label || placeholder}
        </Text>
        <IconifyIcon
          name="lucide:chevron-down"
          size={18}
          color={getThemeColor('muted', isDark)}
        />
      </TouchableOpacity>

      {error && (
        <Text
          className="text-xs text-danger mt-1.5 ml-1"
          accessibilityLiveRegion="polite"
          accessibilityLabel={error}
        >
          {error}
        </Text>
      )}

      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={isOpen ? 0 : -1}
          snapPoints={['90%']}
          handleIndicatorStyle={{ backgroundColor: mutedFg }}
          backgroundStyle={{ backgroundColor: bg }}
          enablePanDownToClose
          onChange={handleSheetChange}
        >
          <View style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-lg font-bold text-foreground">
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={close} hitSlop={8}>
                <IconifyIcon name="lucide:x" color={mutedFg} size={20} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search..."
                placeholderTextColor={emptyColor}
              />
            </View>

            <BottomSheetFlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
              ListFooterComponent={<View style={{ height: 200 }} />}
              renderItem={({ item }) => (
                <OptionItem
                  item={item}
                  isSelected={item.value === value}
                  onSelect={handleSelect}
                  isDark={isDark}
                />
              )}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-muted">No results found</Text>
                </View>
              }
            />
          </View>
        </BottomSheet>
      </Portal>
    </View>
  );
}

export default Select;
