// Shared mocks for all test files
// Import this in your test files: import '@/__tests__/__mocks__';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useFocusEffect: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({})),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: { scheme: 'nestfeed' },
    platformURLForScheme: jest.fn(() => 'https://u.expo.dev/nestfeed'),
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `nestfeed://${path}`),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  subscribe: jest.fn(() => () => {}),
}));

// Mock @react-native-async-storage/async-storage
// Self-contained: requiring the actual module throws outside a RN runtime.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store.has(key) ? (store.get(key) as string) : null)),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  };
});

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationScope: {
    FULL_NAME: 'full_name',
    EMAIL: 'email',
  },
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationButtonType: {
    SIGN_IN: 'sign_in',
    SIGN_UP: 'sign_up',
    SIGN_IN_WITH_APPLE: 'sign_in_with_apple',
    SIGNED_IN: 'signed_in',
  },
  AppleAuthenticationButtonStyle: {
    BLACK: 'black',
    WHITE: 'white',
    WHITE_OUTLINE: 'white_outline',
  },
  useAppleAuthenticationButtonColorUpdate: jest.fn(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'dismissed' })),
  dismissBrowser: jest.fn(() => Promise.resolve()),
  createInitialURL: jest.fn(() => 'nestfeed://oauth?provider=google'),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
  getRandomBytes: jest.fn(() => new Uint8Array([1, 2, 3, 4])),
  digest: jest.fn(() => Promise.resolve('test-digest')),
}));

// Mock burnt (toast library)
jest.mock('burnt', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  setUser: jest.fn(),
  setExtra: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  init: jest.fn(),
  wrap: jest.fn((fn) => fn),
}));

// Mock heroui-native
jest.mock('heroui-native', () => ({
  Input: 'Input',
  Button: 'Button',
  Select: 'Select',
  Switch: 'Switch',
  Chip: 'Chip',
  Card: 'Card',
  CardBody: 'CardBody',
  CardHeader: 'CardHeader',
  CardFooter: 'CardFooter',
  Avatar: 'Avatar',
  Separator: 'Separator',
  Skeleton: 'Skeleton',
  Checkbox: 'Checkbox',
  Progress: 'Progress',
  Spinner: 'Spinner',
  Text: 'Text',
  ListGroup: 'ListGroup',
  RadioGroup: 'RadioGroup',
  Radio: 'Radio',
  Tabs: 'Tabs',
  Surface: 'Surface',
  TextField: 'TextField',
  TextArea: 'TextArea',
  SearchField: 'SearchField',
  Label: 'Label',
  Description: 'Description',
  FieldError: 'FieldError',
  // Function stubs (NOT Object.assign on a string — that boxes the primitive
  // into a String object, which React rejects as an element type).
  Alert: (() => {
    const React = require('react');
    // Wrap text-bearing parts in a Text host so RNTL's getByText matches.
    const text = (props: { children?: unknown }) =>
      React.createElement('Text', null, props?.children ?? null);
    const view = (props: { children?: unknown }) =>
      React.createElement('View', null, props?.children ?? null);
    const Alert = (props: { children?: unknown }) =>
      React.createElement('View', null, props?.children ?? null);
    (Alert as unknown as Record<string, unknown>).Indicator = () => null;
    (Alert as unknown as Record<string, unknown>).Content = view;
    (Alert as unknown as Record<string, unknown>).Title = text;
    (Alert as unknown as Record<string, unknown>).Description = text;
    return Alert;
  })(),
}));

// Mock heroui-native hooks (used by IconifyIcon)
jest.mock('heroui-native/hooks', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
  BottomSheetTextInput: 'BottomSheetTextInput',
  BottomSheetView: 'BottomSheetView',
  useBottomSheetModal: jest.fn(() => ({
    dismissAll: jest.fn(),
    dismiss: jest.fn(),
  })),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: 'GestureDetector',
  Gesture: {
    LongPress: jest.fn(),
    Pan: jest.fn(),
    Pinch: jest.fn(),
    Rotation: jest.fn(),
    Force: jest.fn(),
    Tap: jest.fn(),
  },
  GestureHandlerRootView: 'GestureHandlerRootView',
  State: {
    BEGAN: 0,
    FAILED: 1,
    ACTIVE: 2,
    END: 3,
  },
  Directions: {
    DOWN: 'DOWN',
    UP: 'UP',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
  },
  createAnimatedComponent: jest.fn((c) => c),
  FlatList: 'FlatList',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  Switch: 'Switch',
  Animated: {
    ...jest.requireActual('react-native').Animated,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
  },
  DrawerLayout: 'DrawerLayout',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn((fn) => fn()),
    useAnimatedScrollHandler: jest.fn((fn) => fn),
    useAnimatedReaction: jest.fn(() => {}),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withDelay: jest.fn((_, val) => val),
    withSequence: jest.fn((arr) => arr[0]),
    cancelAnimation: jest.fn(),
    addWhitelistedNativeProps: { className: true },
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Image: 'Image',
  };
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const original = jest.requireActual('react-native-safe-area-context');
  return {
    ...original,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
  };
});

// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => ({
  FlashList: 'FlashList',
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  useUnwindNavigator: jest.fn(() => ({ goBack: jest.fn() })),
  UnwindView: 'UnwindView',
  useUnwind: jest.fn(() => ({ unwind: jest.fn() })),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
  setOptions: jest.fn(),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock expo-build-properties
jest.mock('expo-build-properties', () => ({}));

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  SharedValue: jest.fn(),
  useSharedValue: jest.fn((val) => ({ value: val })),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Rect: 'Rect',
  Path: 'Path',
  G: 'G',
  Text: 'Text',
  Defs: 'Defs',
  Stop: 'Stop',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  TSpan: 'TSpan',
  Ellipse: 'Ellipse',
  Line: 'Line',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  Use: 'Use',
  View: 'View',
}));

// Mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => ({
  BannerView: 'BannerView',
  InterstitialAd: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    show: jest.fn(),
    load: jest.fn(),
  })),
  RewardedAd: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    show: jest.fn(),
    load: jest.fn(),
  })),
  setRequestConfiguration: jest.fn(),
}));

// Mock react-native-portalize
jest.mock('react-native-portalize', () => ({
  PortalProvider: ({ children }) => children,
}));

// Mock react-native-enriched-markdown
jest.mock('react-native-enriched-markdown', () => ({
  MarkdownView: 'MarkdownView',
}));

// Mock @huymobile/react-native-iconify
jest.mock('@huymobile/react-native-iconify', () => ({
  IconifyIcon: 'IconifyIcon',
}));

// expo-image is no longer used; react-native Image is used instead
