module.exports = {
  preset: 'react-native',
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react$': require.resolve('react'),
    '^react-native$': require.resolve('react-native'),
    '^@hoohacks26/shared$': '<rootDir>/../../node_modules/@hoohacks26/shared/src/index.ts',
    '^react-native-maps$': '<rootDir>/src/__mocks__/react-native-maps.ts',
    '^expo-location$': '<rootDir>/src/__mocks__/expo-location.ts',
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^expo-router$': '<rootDir>/src/__mocks__/expo-router.ts',
    '^socket\\.io-client$': '<rootDir>/src/__mocks__/socket.io-client.ts',
    '^axios$': '<rootDir>/src/__mocks__/axios.ts',
    '^expo.*$': '<rootDir>/src/__mocks__/expo-stub.ts',
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|@hoohacks26/.*|zustand)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Inject env vars into the test environment globals
  testEnvironmentOptions: {
    env: {
      EXPO_PUBLIC_API_URL: 'http://localhost:3001',
      EXPO_PUBLIC_SOCKET_URL: 'http://localhost:3001',
    },
  },
};
