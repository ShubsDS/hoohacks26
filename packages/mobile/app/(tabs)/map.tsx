import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useReports } from '../../src/hooks/useReports';
import { Report } from '../../src/stores/reports.store';
import { Colors, Fonts, MonographMapStyle, toSeverityLevel, SeverityConfig } from '../../src/theme/tokens';
import { UVA_REGION } from '../../src/lib/constants';

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

const SEVERITY_MARKER_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626', // red
  HIGH:     '#F97316', // orange
  MEDIUM:   '#EAB308', // yellow
  LOW:      '#22C55E', // green
};

function getMarkerColor(severity: string): string {
  return SEVERITY_MARKER_COLORS[severity] || Colors.gold;
}

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { reports } = useReports(
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

  const openNavigation = (lat: number, lng: number, name: string) => {
    const encodedName = encodeURIComponent(name);
    const url =
      Platform.select({
        ios: `maps:0,0?q=${encodedName}&ll=${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodedName})`,
      }) || `https://maps.google.com/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={UVA_REGION}
        showsUserLocation
        showsMyLocationButton
        userInterfaceStyle="light"
      >
        {reports.map((report) => {
          const markerColor = getMarkerColor(report.severity);
          return (
            <React.Fragment key={report.id}>
              <Marker
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                onPress={() => setSelectedReport(report)}
              >
                <View style={[styles.customMarker, { backgroundColor: markerColor }]}>
                  <View style={styles.markerRing} />
                </View>
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
            </React.Fragment>
          );
        })}
      </MapView>

      {/* FAB to create new report */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/report/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Report preview bottom sheet */}
      <Modal
        visible={!!selectedReport}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedReport(null)}
        >
          <View
            style={styles.bottomSheet}
            onStartShouldSetResponder={() => true}
          >
            {selectedReport && (() => {
              const level = toSeverityLevel(selectedReport.severity);
              const config = SeverityConfig[level];
              return (
                <>
                  <View style={styles.sheetHandle} />

                  <Text style={[styles.sheetBadge, { color: config.labelColor }]}>
                    {config.label}
                  </Text>

                  <Text style={styles.sheetTitle}>
                    {selectedReport.title}
                  </Text>

                  <Text style={styles.sheetCategory}>
                    {selectedReport.category} · {formatTimeAgo(selectedReport.createdAt)}
                  </Text>

                  <View style={styles.sheetMeta}>
                    <Text style={styles.sheetMetaText}>
                      {selectedReport.confirmationCount} confirmed · {selectedReport.radiusMeters}m radius
                    </Text>
                  </View>

                  {selectedReport.description && (
                    <Text style={styles.sheetDesc}>
                      {selectedReport.description}
                    </Text>
                  )}

                  <View style={styles.sheetActions}>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => {
                        setSelectedReport(null);
                        router.push(`/report/${selectedReport.id}`);
                      }}
                    >
                      <Text style={styles.detailButtonText}>
                        View Details
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={() =>
                        openNavigation(
                          selectedReport.latitude,
                          selectedReport.longitude,
                          selectedReport.title,
                        )
                      }
                    >
                      <Text style={styles.navButtonText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedReport(null)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  map: { flex: 1 },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textPrimary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    color: Colors.gold,
    fontFamily: Fonts.cormorantLight,
    fontWeight: 'normal',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGold,
    padding: 24,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetBadge: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'normal',
  },
  sheetTitle: {
    fontFamily: Fonts.groteskBlack,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: 'normal',
  },
  sheetCategory: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 8,
    fontWeight: 'normal',
  },
  sheetMeta: {
    marginBottom: 12,
  },
  sheetMetaText: {
    fontFamily: Fonts.grotesk,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
  sheetDesc: {
    fontFamily: Fonts.grotesk,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: 'normal',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailButton: {
    flex: 1,
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailButtonText: {
    color: Colors.gold,
    fontFamily: Fonts.groteskBold,
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: 'normal',
  },
  navButton: {
    flex: 1,
    backgroundColor: Colors.bgCTASecondary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.groteskBold,
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: 'normal',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  closeButtonText: {
    color: Colors.textTertiary,
    fontFamily: Fonts.cormorantItalic,
    fontSize: 12,
    fontWeight: 'normal',
  },
});
