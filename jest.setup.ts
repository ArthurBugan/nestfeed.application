import '@testing-library/jest-dom';

// Import shared mocks
import '@/__tests__/__mocks__';

// Set up global test helpers
globalThis.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// react-native/index.js reads this global during module load (it ships for the
// production bundle, not jest). Provide a no-op shim so @testing-library/
// react-native + react-native can be imported in unit tests.
(globalThis as any).ReactNativePublicAPI = {
  __DEV__: false,
  warning: () => {},
  error: () => {},
  global: {},
};

// Mock console.warn and console.error during tests to reduce noise
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  console.warn = jest.fn((...args) => originalWarn(...args));
  console.error = jest.fn((...args) => originalError(...args));
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
  jest.useRealTimers();
});
