import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import api from '../../src/lib/api';
import { Colors, Fonts, Spacing } from '../../src/theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!email.endsWith('@virginia.edu')) {
      setError('Email must end in @virginia.edu');
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        displayName: displayName.trim(),
      });
      await login(data.user, data.token);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.systemLabel}>HOOSALERT SYSTEM</Text>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>
            join the campus safety network
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { marginTop: 18 }]}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@virginia.edu"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 18 }]}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.registerButton, loading && { opacity: 0.5 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  systemLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 3.2,
    marginBottom: 4,
    fontWeight: 'normal',
  },
  title: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 36,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  subtitle: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: 'normal',
  },
  form: {},
  label: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 2.1,
    color: Colors.textTertiary,
    marginBottom: 8,
    fontWeight: 'normal',
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.grotesk,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  errorText: {
    fontFamily: Fonts.grotesk,
    color: Colors.severityCritical,
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  registerButton: {
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  registerButtonText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontFamily: Fonts.cormorantItalic,
    color: Colors.textTertiary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  loginLinkBold: {
    fontFamily: Fonts.cormorantBold,
    color: Colors.gold,
    fontWeight: 'normal',
  },
});
