import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Report, useReportsStore } from '../../src/stores/reports.store';
import ConfirmButton from '../../src/components/reports/ConfirmButton';
import api from '../../src/lib/api';
import { Colors, Fonts, Spacing, MonographMapStyle, toSeverityLevel, SeverityConfig } from '../../src/theme/tokens';

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
          <ActivityIndicator size="large" color={Colors.gold} />
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

  const level = toSeverityLevel(report.severity);
  const config = SeverityConfig[level];
  const markerColor = level === 'P1' ? Colors.severityCritical : Colors.gold;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.gold,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Severity badge */}
        <Text style={[styles.badge, { color: config.labelColor }]}>
          {config.label}
        </Text>

        {/* Title */}
        <Text style={styles.title}>{report.title}</Text>

        {/* Category subtitle */}
        <Text style={styles.subtitle}>{report.category}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Detail fields */}
        <DetailField label="STATUS" value={report.status} />
        <DetailField label="SEVERITY" value={report.severity} />
        <DetailField label="REPORTED" value={formatTimeAgo(report.createdAt)} />
        <DetailField label="RADIUS" value={`${report.radiusMeters}m`} />
        <DetailField label="CONFIRMATIONS" value={String(report.confirmationCount)} />

        {/* Description */}
        {report.description && (
          <>
            <View style={styles.divider} />
            <DetailField label="DESCRIPTION" value={report.description} />
          </>
        )}

        {/* Photo */}
        {report.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>ATTACHED PHOTO</Text>
            <Image
              source={{ uri: report.imageUrl }}
              style={styles.reportImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Reporter */}
        <View style={styles.divider} />
        <DetailField
          label="REPORTER"
          value={report.reporter?.displayName || 'Anonymous'}
        />
        {report.reporter && (
          <DetailField
            label="CREDIBILITY"
            value={report.reporter.credibilityScore.toFixed(1)}
          />
        )}

        {/* Admin note */}
        {report.adminNote && (
          <View style={styles.adminNoteBox}>
            <Text style={styles.fieldLabel}>ADMIN NOTE</Text>
            <Text style={styles.adminNoteText}>{report.adminNote}</Text>
          </View>
        )}

        {/* Map */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>LOCATION</Text>
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
              userInterfaceStyle="light"
            >
              <Marker
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
              >
                <View style={[styles.customMarker, { backgroundColor: markerColor }]} />
              </Marker>
              <Circle
                center={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                radius={report.radiusMeters}
                fillColor={`${markerColor}40`}
                strokeColor={`${markerColor}80`}
                strokeWidth={1}
              />
            </MapView>
          </View>
        </View>

        {/* Confirmation */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>CONFIRMATIONS</Text>
          <Text style={styles.confirmCount}>
            {report.confirmationCount} people have confirmed this report
          </Text>
          <ConfirmButton
            reportId={report.id}
            count={report.confirmationCount}
            onConfirmed={(updatedReport) => {
              setReport(updatedReport);
              updateReport(updatedReport);
            }}
          />
        </View>

        {/* Timestamp footer */}
        <Text style={styles.timestampFooter}>
          {new Date(report.createdAt).toLocaleString()}
        </Text>
      </ScrollView>
    </>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  notFound: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 16,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  badge: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: 'normal',
  },
  title: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'normal',
  },
  subtitle: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGold,
    marginVertical: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 2.1,
    color: Colors.textTertiary,
    marginBottom: 4,
    fontWeight: 'normal',
  },
  fieldValue: {
    fontFamily: Fonts.grotesk,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  adminNoteBox: {
    backgroundColor: 'rgba(220,195,140,0.05)',
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  adminNoteText: {
    fontFamily: Fonts.grotesk,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontWeight: 'normal',
  },
  mapContainer: {
    height: 160,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: 'hidden',
    marginTop: 6,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  reportImage: {
    width: '100%',
    height: 220,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginTop: 6,
  },
  confirmCount: {
    fontFamily: Fonts.grotesk,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: 'normal',
  },
  timestampFooter: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontWeight: 'normal',
  },
});
