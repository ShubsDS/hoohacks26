import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useReports } from '../../src/hooks/useReports';
import { Report } from '../../src/stores/reports.store';
import ReportCard from '../../src/components/reports/ReportCard';
import { UVA_NAVY, UVA_REGION } from '../../src/lib/constants';

export default function ReportsScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const sorted = [...reports].sort((a, b) => {
    const weightA =
      a.credibilityWeight * (1 + a.confirmationCount * 0.2);
    const weightB =
      b.credibilityWeight * (1 + b.confirmationCount * 0.2);
    return weightB - weightA;
  });

  const handlePress = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  if (isLoading && reports.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UVA_NAVY} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={UVA_NAVY}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reports nearby</Text>
            <Text style={styles.emptySubtitle}>
              Reports within 2km will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#777',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UVA_NAVY,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
});
