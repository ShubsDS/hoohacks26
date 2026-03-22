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
import { Colors, Fonts, Spacing } from '../../src/theme/tokens';

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
          <Text style={styles.systemLabel}>HOOSALERT SYSTEM</Text>
          <Text style={styles.appName}>Active</Text>
          <Text style={styles.tagline}>campus incident monitor</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="you@virginia.edu"
            placeholderTextColor={Colors.textMuted}
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

          <Text style={[styles.label, { marginTop: 18 }]}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={Colors.textMuted}
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
            style={[styles.loginButton, loading && { opacity: 0.5 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
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
    backgroundColor: Colors.bg,
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
  systemLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 3.2,
    marginBottom: 4,
    fontWeight: 'normal',
  },
  appName: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 48,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  tagline: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: 'normal',
  },
  form: {
    marginBottom: 40,
  },
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
  inputError: {
    borderColor: Colors.severityCritical,
  },
  errorText: {
    fontFamily: Fonts.grotesk,
    color: Colors.severityCritical,
    fontSize: 11,
    marginTop: 6,
    fontWeight: 'normal',
  },
  loginButton: {
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  loginButtonText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontFamily: Fonts.cormorantItalic,
    color: Colors.textTertiary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  registerBold: {
    fontFamily: Fonts.cormorantBold,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  footer: {
    fontFamily: Fonts.cormorantItalic,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: 'normal',
  },
});
