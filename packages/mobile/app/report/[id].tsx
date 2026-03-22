import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Report, useReportsStore } from '../../src/stores/reports.store';
import ConfirmButton from '../../src/components/reports/ConfirmButton';
import SeverityBadge from '../../src/components/ui/SeverityBadge';
import CredibilityBar from '../../src/components/ui/CredibilityBar';
import api from '../../src/lib/api';
import {
  UVA_NAVY,
  UVA_ORANGE,
  CATEGORY_COLORS,
  EXPIRY_HOURS,
} from '../../src/lib/constants';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return UVA_ORANGE;
    case 'ADMIN_VERIFIED':
      return '#4CAF50';
    case 'RESOLVED':
      return '#999';
    case 'DISMISSED':
      return '#999';
    default:
      return '#999';
  }
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, updateReport } = useReportsStore();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = reports.find((r) => r.id === id);
    if (cached) {
      setReport(cached);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await api.get(`/reports/nearby`, {
          params: { lat: 38.0336, lng: -78.508, radius: 10000 },
        });
        const found = (data as Report[]).find((r: Report) => r.id === id);
        if (found) setReport(found);
      } catch {
        // failed to fetch
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Report' }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UVA_NAVY} />
        </View>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Stack.Screen options={{ title: 'Report' }} />
        <View style={styles.center}>
          <Text style={styles.notFound}>Report not found</Text>
        </View>
      </>
    );
  }

  const catColor = CATEGORY_COLORS[report.category] || '#999';
  const expiryHrs = EXPIRY_HOURS[report.category] ?? 24;

  return (
    <>
      <Stack.Screen options={{ title: report.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View
            style={[styles.categoryDot, { backgroundColor: catColor }]}
          />
          <Text style={styles.category}>{report.category}</Text>
          <SeverityBadge severity={report.severity} />
        </View>

        <Text style={styles.title}>{report.title}</Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor(report.status) },
            ]}
          >
            <Text style={styles.statusText}>{report.status}</Text>
          </View>
          <Text style={styles.timeText}>
            {formatTimeAgo(report.createdAt)}
          </Text>
          <Text style={styles.expiryText}>
            Expires in {expiryHrs}h
          </Text>
        </View>

        {/* Description */}
        {report.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {report.description}
            </Text>
          </View>
        )}

        {/* Reporter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporter</Text>
          <Text style={styles.reporterName}>
            {report.reporter?.displayName || 'Anonymous'}
          </Text>
          {report.reporter && (
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Credibility:</Text>
              <View style={{ flex: 1 }}>
                <CredibilityBar
                  score={report.reporter.credibilityScore}
                />
              </View>
            </View>
          )}
        </View>

        {/* Admin note */}
        {report.adminNote && (
          <View style={styles.adminNoteBox}>
            <Text style={styles.adminNoteLabel}>Admin Note</Text>
            <Text style={styles.adminNoteText}>
              {report.adminNote}
            </Text>
          </View>
        )}

        {/* Map thumbnail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: report.latitude,
                longitude: report.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                pinColor={catColor}
              />
              <Circle
                center={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                radius={report.radiusMeters}
                fillColor={`${catColor}20`}
                strokeColor={`${catColor}60`}
                strokeWidth={2}
              />
            </MapView>
          </View>
          <Text style={styles.radiusLabel}>
            {report.radiusMeters}m radius
          </Text>
        </View>

        {/* Confirmation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmations</Text>
          <Text style={styles.confirmCount}>
            {report.confirmationCount} people have confirmed this report
          </Text>
          <ConfirmButton
            reportId={report.id}
            count={report.confirmationCount}
            onConfirmed={() => {
              const updated = {
                ...report,
                confirmationCount: report.confirmationCount + 1,
              };
              setReport(updated);
              updateReport(updated);
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 16,
    color: '#999',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: UVA_NAVY,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    color: '#777',
  },
  expiryText: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UVA_NAVY,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  reporterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  credLabel: {
    fontSize: 13,
    color: '#777',
  },
  adminNoteBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  adminNoteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 4,
  },
  adminNoteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  radiusLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
  },
  confirmCount: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
});
