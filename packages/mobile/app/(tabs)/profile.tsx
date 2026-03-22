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
import { Colors, Fonts, Spacing } from '../../src/theme/tokens';

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
        <ActivityIndicator size="large" color={Colors.gold} />
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
        <Text style={styles.sectionLabel}>CREDIBILITY SCORE</Text>
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
        <Text style={styles.sectionLabel}>STATS</Text>
        <InfoRow label="Reports Submitted" value={String(user.totalReports ?? 0)} />
        <InfoRow label="Reports Confirmed" value={String(user.confirmedReports ?? 0)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Role" value={user.isAdmin ? 'Administrator' : 'Student'} />
        <InfoRow label="Institution" value="University of Virginia" />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, loading && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={styles.logoutText}>
          {loading ? 'Signing out...' : 'SIGN OUT'}
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
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  header: {
    backgroundColor: Colors.headerRed,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 28,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  name: {
    fontFamily: Fonts.groteskBold,
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  email: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: 'normal',
  },
  section: {
    backgroundColor: Colors.bgCard,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 2.1,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    fontWeight: 'normal',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreNumber: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 36,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  scoreMax: {
    fontFamily: Fonts.cormorantLight,
    fontSize: 18,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  scoreExplanation: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 10,
    lineHeight: 18,
    fontWeight: 'normal',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  infoLabel: {
    fontFamily: Fonts.grotesk,
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  infoValue: {
    fontFamily: Fonts.grotesk,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(200,60,35,0.15)',
    borderWidth: 1,
    borderColor: Colors.borderRed,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.severityCritical,
    fontWeight: 'normal',
  },
});
