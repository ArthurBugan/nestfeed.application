/** @type {import('jest').Config} */
const rnPreset = require('@react-native/jest-preset');

// Based on the React Native jest preset (needed for Flow-typed RN sources and
// its native mocks), with project-specific test matching, path aliasing and
// coverage settings. TypeScript is transpiled by @react-native/babel-preset;
// type checking happens separately via `tsc --noEmit`.
module.exports = {
  rootDir: '.',
  roots: ['<rootDir>/src'],

  haste: rnPreset.haste,
  resolver: rnPreset.resolver,
  testEnvironment: rnPreset.testEnvironment,
  setupFiles: [...(rnPreset.setupFiles || [])],

  transform: {
    // Our babel-jest entry must come first: Jest transforms use the first
    // matching pattern, and this one carries the RN preset (Flow stripping).
    // The commonjs plugin also rewrites dynamic import() for the Jest VM.
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@react-native/babel-preset'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    ],
    ...(rnPreset.transform || {}),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native(-community)?|@shopify/flash-list)/)',
  ],

  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    // Skip tests that require a full RN runtime / dev server
    '/src/__tests__/hooks/',
    '/src/__tests__/integration/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    ...(rnPreset.moduleNameMapper || {}),
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
