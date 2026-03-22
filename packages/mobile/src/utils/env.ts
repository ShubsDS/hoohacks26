function safeEnvGet(key: string, fallback: string): string {
  try {
    const val = (process as any).env[key];
    return val || fallback;
  } catch {
    return fallback;
  }
}

export const API_URL = safeEnvGet('EXPO_PUBLIC_API_URL', 'http://localhost:3001');
export const SOCKET_URL = safeEnvGet('EXPO_PUBLIC_SOCKET_URL', 'http://localhost:3001');
