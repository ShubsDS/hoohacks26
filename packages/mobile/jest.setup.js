// Polyfill process.env for React Native test environment
if (typeof process === 'undefined') {
  global.process = { env: {} };
} else if (typeof process.env === 'undefined') {
  process.env = {};
}
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3001';
process.env.EXPO_PUBLIC_SOCKET_URL = 'http://localhost:3001';
