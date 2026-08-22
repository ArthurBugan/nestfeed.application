import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Input } from 'heroui-native';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import BottomSheet, { BottomSheetFlatList } from '@expo/ui/community/bottom-sheet';
import { Portal } from 'react-native-portalize';

interface Category {
  name: string;
  key: string;
  icons: string[];
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

function IconButton({ iconName, selectedValue, onSelect }: { iconName: string; selectedValue: string; onSelect: (iconName: string) => void }) {
  const displayName = iconName.includes(':') ? iconName : `twemoji:${iconName}`;
  const isSelected = selectedValue === displayName;

  return (
    <TouchableOpacity
      onPress={() => onSelect(displayName)}
      className={`w-11 m-1 h-11 items-center justify-center rounded-lg ${isSelected ? 'bg-accent/20 border-2 border-primary' : 'bg-default'}`}
    >
      <IconifyIcon name={displayName} size={24} />
      {isSelected && (
        <View className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full items-center justify-center">
          <Text className="text-accent-foreground text-xs">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function IconPicker({ value, onChange, label, error }: IconPickerProps) {
  const { isDark } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          'https://api.iconify.design/collection?prefix=twemoji&chars=true&aliases=true'
        ).then((r) => r.json());

        const cats: Category[] = Object.keys(resp.categories).map((category) => ({
          name: category,
          key: category,
          icons: resp.categories[category],
        }));
        setCategories(cats);
        setActiveCategory(cats[0]?.key || '');
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleIconSelect = useCallback(
    (iconName: string) => {
      const formatted = iconName.includes(':') ? iconName : `twemoji:${iconName}`;
      setIsOpen(false);
      onChange(formatted);
    },
    [onChange]
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setSearchTerm('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  const handleFilter = useCallback((text: string) => {
    setSearchTerm(text);
    clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(async () => {
      if (text.trim() === '') {
        setFilteredIcons([]);
        return;
      }

      try {
        const resp = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(text)}&limit=200`
        ).then((r) => r.json());
        setFilteredIcons(resp?.icons || []);
      } catch {
        setFilteredIcons([]);
      }
    }, 500);
  }, []);

  const activeIcons = useMemo(
    () => (activeCategory ? categories.find((c) => c.key === activeCategory)?.icons || [] : []),
    [categories, activeCategory]
  );

  const bg = getThemeColor('popover', isDark);
  const mutedFg = getThemeColor('muted-foreground', isDark);
  const muted = getThemeColor('muted', isDark);

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1">{label}</Text>
      )}

      <TouchableOpacity
        onPress={open}
        className={`flex-row items-center bg-default border rounded-lg px-4 py-3 ${error ? 'border-danger' : 'border-border'}`}
      >
        <IconifyIcon name={value || 'lucide:folder'} size={20} />
        <Text className={`ml-3 flex-1 ${value ? 'text-foreground' : 'text-muted'}`}>
          {value || 'Select icon'}
        </Text>
      </TouchableOpacity>

      {error && <Text className="text-xs text-danger mt-1">{error}</Text>}

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
              <Text className="text-lg font-bold text-foreground">Choose an Icon</Text>
              <TouchableOpacity onPress={close} hitSlop={8}>
                <IconifyIcon name="lucide:x" color={mutedFg} size={20} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Input
                value={searchTerm}
                onChangeText={handleFilter}
                placeholder="Search icons..."
                placeholderTextColor={muted}
              />
            </View>

            {isLoading ? (
              <View className="items-center py-10 flex-1">
                <Text className="text-muted">Loading icons...</Text>
              </View>
            ) : searchTerm ? (
              <View style={{ flex: 1 }}>
                <Text className="text-sm text-muted mb-2">
                  Found {filteredIcons.length} icons matching "{searchTerm}"
                </Text>
                <BottomSheetFlatList
                  data={filteredIcons}
                  numColumns={7}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                  ListFooterComponent={<View style={{ height: 200 }} />}
                  renderItem={({ item: iconName }) => (
                    <IconButton
                      iconName={iconName}
                      selectedValue={value}
                      onSelect={handleIconSelect}
                    />
                  )}
                />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-2"
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-full mr-2 ${activeCategory === cat.key ? 'bg-accent' : 'bg-default'}`}
                    >
                      <Text
                        className={`text-xs font-medium ${activeCategory === cat.key ? 'text-accent-foreground' : 'text-muted'}`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <BottomSheetFlatList
                  data={activeIcons}
                  numColumns={7}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                  ListFooterComponent={<View style={{ height: 200 }} />}
                  renderItem={({ item: iconName }) => (
                    <IconButton
                      iconName={iconName}
                      selectedValue={value}
                      onSelect={handleIconSelect}
                    />
                  )}
                />
              </View>
            )}
          </View>
        </BottomSheet>
      </Portal>
    </View>
  );
}

export default IconPicker;
