import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import api from '../../src/lib/api';

const UVA_NAVY = '#232D4B';
const UVA_ORANGE = '#E57200';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setEmailError('');
    setLoginError('');

    if (!email.endsWith('@virginia.edu')) {
      setEmailError('Email must end in @virginia.edu');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await login(data.user, data.token);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <Text style={styles.appName}>HoosAlert</Text>
          <Text style={styles.tagline}>UVA Campus Safety Network</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="you@virginia.edu"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (loginError) setLoginError('');
            }}
            secureTextEntry
          />
          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>University of Virginia</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UVA_NAVY,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: UVA_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 4,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: UVA_ORANGE,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  registerBold: {
    color: UVA_ORANGE,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
  },
});
