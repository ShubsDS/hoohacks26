import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth.store';
import { UVA_NAVY, UVA_ORANGE } from '../../constants/map';
import { API_URL } from '../../utils/env';

export default function RegisterScreen() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string): boolean {
    if (!value.toLowerCase().endsWith('@virginia.edu')) {
      setEmailError('Must use a @virginia.edu email address.');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleRegister() {
    if (!validateEmail(email)) return;
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password, displayName });
      await loadFromStorage();
      router.replace('/(tabs)/map');
    } catch {
      Alert.alert('Registration Failed', 'An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>UVA students only</Text>

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="UVA Email (@virginia.edu)"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (emailError) validateEmail(v);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        testID="displayname-input"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
        testID="register-button"
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} testID="login-link">
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: UVA_NAVY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 8,
  },
  button: {
    width: '100%',
    backgroundColor: UVA_ORANGE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: UVA_NAVY,
    fontSize: 14,
  },
});
