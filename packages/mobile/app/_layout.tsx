import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_700Bold,
  CormorantGaramond_300Light_Italic,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  SchibstedGrotesk_400Regular,
  SchibstedGrotesk_700Bold,
  SchibstedGrotesk_900Black,
} from '@expo-google-fonts/schibsted-grotesk';
import { useAuthStore } from '../src/stores/auth.store';
import { Colors, Fonts } from '../src/theme/tokens';

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
    } else if (token && (inAuthGroup || segments.length === 0 || segments[0] === undefined)) {
      router.replace('/(tabs)/map');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLabel}>HOOSALERT</Text>
        <Text style={styles.splashTitle}>Active</Text>
        <Text style={styles.splashSubtitle}>campus incident monitor</Text>
        <ActivityIndicator size="large" color={Colors.gold} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="report"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.gold,
          headerTitleStyle: { fontFamily: Fonts.groteskBold, fontWeight: 'normal' },
        }}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_700Bold,
    CormorantGaramond_300Light_Italic,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_700Bold_Italic,
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_700Bold,
    SchibstedGrotesk_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  splashLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 3.2,
    fontWeight: 'normal',
  },
  splashTitle: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 42,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  splashSubtitle: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
});
