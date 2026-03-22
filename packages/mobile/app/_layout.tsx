import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/auth.store';
import { UVA_NAVY, UVA_ORANGE } from '../src/lib/constants';

const queryClient = new QueryClient();

function AuthGate() {
  const { token, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)/map');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>HoosAlert</Text>
        <ActivityIndicator size="large" color={UVA_ORANGE} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: UVA_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
