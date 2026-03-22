import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useReports } from '../../src/hooks/useReports';
import { Report } from '../../src/stores/reports.store';
import SeverityBadge from '../../src/components/ui/SeverityBadge';
import {
  UVA_NAVY,
  UVA_ORANGE,
  CATEGORY_COLORS,
  UVA_REGION,
} from '../../src/lib/constants';

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(
    null,
  );

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
      >
        {reports.map((report) => (
          <React.Fragment key={report.id}>
            <Marker
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              pinColor={CATEGORY_COLORS[report.category] || '#999'}
              onPress={() => setSelectedReport(report)}
            />
            <Circle
              center={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              radius={report.radiusMeters}
              fillColor={`${CATEGORY_COLORS[report.category] || '#999'}20`}
              strokeColor={`${CATEGORY_COLORS[report.category] || '#999'}60`}
              strokeWidth={1}
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        {Object.entries(CATEGORY_COLORS)
          .slice(0, 4)
          .map(([cat, color]) => (
            <View key={cat} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: color }]}
              />
              <Text style={styles.legendText}>{cat}</Text>
            </View>
          ))}
      </View>

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
            {selectedReport && (
              <>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[selectedReport.category],
                      },
                    ]}
                  />
                  <Text style={styles.sheetTitle}>
                    {selectedReport.title}
                  </Text>
                </View>

                <View style={styles.sheetMeta}>
                  <SeverityBadge severity={selectedReport.severity} />
                  <Text style={styles.sheetCategory}>
                    {selectedReport.category}
                  </Text>
                  <Text style={styles.sheetConfirm}>
                    {selectedReport.confirmationCount} confirmed
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
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  legendTitle: {
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
    color: UVA_NAVY,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: { fontSize: 10, color: '#555' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UVA_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, color: '#FFF', fontWeight: '600', marginTop: -2 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: UVA_NAVY,
    flex: 1,
  },
  sheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sheetCategory: { fontSize: 13, color: '#777' },
  sheetConfirm: { fontSize: 13, color: '#2196F3', fontWeight: '600' },
  sheetDesc: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailButton: {
    flex: 1,
    backgroundColor: UVA_NAVY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  navButton: {
    flex: 1,
    backgroundColor: UVA_ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  closeButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  closeButtonText: { color: '#666', fontSize: 14, fontWeight: '600' },
});
