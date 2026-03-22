import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useReports } from '../../src/hooks/useReports';
import { Report } from '../../src/stores/reports.store';
import EmergencyHeader from '../../src/components/monograph/EmergencyHeader';
import CTAStrip from '../../src/components/monograph/CTAStrip';
import SeverityCard from '../../src/components/monograph/SeverityCard';
import { Colors, Fonts, toSeverityLevel } from '../../src/theme/tokens';
import { UVA_REGION } from '../../src/lib/constants';

type SortMode = 'recent' | 'confirmed';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

function getAlertLevel(reports: Report[]): {
  level: 'Low' | 'Elevated' | 'High' | 'Critical';
  activePips: number;
  criticalPips: number;
  warningPips: number;
} {
  const criticalCount = reports.filter(
    (r) => r.severity === 'CRITICAL' || r.severity === 'HIGH',
  ).length;
  const medCount = reports.filter((r) => r.severity === 'MEDIUM').length;

  if (criticalCount >= 3) return { level: 'Critical', activePips: 4, criticalPips: 4, warningPips: 0 };
  if (criticalCount >= 1) return { level: 'High', activePips: 3, criticalPips: criticalCount, warningPips: 1 };
  if (medCount >= 2) return { level: 'Elevated', activePips: 2, criticalPips: 0, warningPips: 2 };
  return { level: 'Low', activePips: 1, criticalPips: 0, warningPips: 0 };
}

export default function ReportsScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const { reports, isLoading, refetch } = useReports(
    location?.lat ?? UVA_REGION.latitude,
    location?.lng ?? UVA_REGION.longitude,
  );

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    })();
  }, []);

  const sorted = useMemo(() => {
    let filtered = emergencyOnly
      ? reports.filter((r) => r.category === 'EMERGENCY')
      : reports;
    return [...filtered].sort((a, b) => {
      if (sortMode === 'confirmed') {
        return b.confirmationCount - a.confirmationCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reports, emergencyOnly, sortMode]);

  const alertInfo = getAlertLevel(reports);

  const handlePress = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  if (isLoading && reports.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmergencyHeader
        alertLevel={alertInfo.level}
        activePips={alertInfo.activePips}
        criticalPips={alertInfo.criticalPips}
        warningPips={alertInfo.warningPips}
      />
      <CTAStrip onSafeRoute={() => router.push('/(tabs)/map')} />

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            emergencyOnly && styles.filterPillActive,
          ]}
          onPress={() => setEmergencyOnly(!emergencyOnly)}
        >
          <Text
            style={[
              styles.filterPillText,
              emergencyOnly && { color: Colors.severityCritical },
            ]}
          >
            EMERGENCY ONLY
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            sortMode === 'confirmed' && styles.filterPillActive,
          ]}
          onPress={() => setSortMode(sortMode === 'recent' ? 'confirmed' : 'recent')}
        >
          <Text style={styles.filterPillText}>
            {sortMode === 'recent' ? 'RECENT' : 'CONFIRMED'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SeverityCard
            level={toSeverityLevel(item.severity)}
            category={`${item.category} · ${item.confirmationCount} confirmed`}
            title={item.title}
            detail={item.description || `${item.radiusMeters}m radius`}
            timestamp={formatTimeAgo(item.createdAt)}
            onPress={() => handlePress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active incidents</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  filterPillActive: {
    borderColor: Colors.borderGoldStrong,
    backgroundColor: Colors.bgCTA,
  },
  filterPillText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7,
    letterSpacing: 1.05,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: Fonts.cormorantItalic,
    fontSize: 15,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 16,
    color: Colors.goldFaint,
    fontWeight: 'normal',
  },
});
