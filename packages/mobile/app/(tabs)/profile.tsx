import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../../src/stores/auth.store';
import CredibilityBar from '../../src/components/ui/CredibilityBar';
import api from '../../src/lib/api';

const UVA_NAVY = '#232D4B';
const UVA_ORANGE = '#E57200';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        // keep existing user data
      }
    })();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UVA_NAVY} />
      </View>
    );
  }

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credibility Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>
            {user.credibilityScore.toFixed(1)}
          </Text>
          <Text style={styles.scoreMax}> / 3.0</Text>
        </View>
        <CredibilityBar score={user.credibilityScore} />
        <Text style={styles.scoreExplanation}>
          Your credibility increases when others confirm your reports
          and decreases if reports are dismissed.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <InfoRow
          label="Reports Submitted"
          value={String(user.totalReports ?? 0)}
        />
        <InfoRow
          label="Reports Confirmed"
          value={String(user.confirmedReports ?? 0)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <InfoRow label="Email" value={user.email} />
        <InfoRow
          label="Role"
          value={user.isAdmin ? 'Administrator' : 'Student'}
        />
        <InfoRow label="Institution" value="University of Virginia" />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, loading && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={styles.logoutText}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: UVA_NAVY,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: UVA_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UVA_NAVY,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: UVA_NAVY,
  },
  scoreMax: {
    fontSize: 18,
    color: '#999',
  },
  scoreExplanation: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
