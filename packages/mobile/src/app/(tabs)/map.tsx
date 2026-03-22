import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { router } from 'expo-router';
import { Report } from '@hoohacks26/shared';
import { UserMarker } from '../../components/map/UserMarker';
import { ReportMarker } from '../../components/map/ReportMarker';
import { RadiusCircle } from '../../components/map/RadiusCircle';
import { useAuthStore } from '../../stores/auth.store';
import { useLocationStore } from '../../stores/location.store';
import { useLocation } from '../../hooks/useLocation';
import { useSocket } from '../../hooks/useSocket';
import { UVA_CAMPUS, UVA_ORANGE } from '../../constants/map';

// Reports store will be wired in by Dev 3 — stub for now
const useReportsStub = (): Report[] => [];

export default function MapScreen() {
  const token = useAuthStore((s) => s.token);
  const coords = useLocationStore((s) => s.coords);
  const reports = useReportsStub();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useLocation(token);
  useSocket(token);

  function handleMarkerPress(report: Report) {
    setSelectedReport(report);
    router.push(`/report/${report.id}`);
  }

  return (
    <View style={styles.container} testID="map-screen">
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: UVA_CAMPUS.latitude,
          longitude: UVA_CAMPUS.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        testID="map-view"
      >
        {coords && (
          <UserMarker latitude={coords.latitude} longitude={coords.longitude} />
        )}

        {reports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            onPress={() => handleMarkerPress(report)}
          />
        ))}

        {selectedReport && (
          <RadiusCircle
            latitude={selectedReport.latitude}
            longitude={selectedReport.longitude}
            radiusMeters={selectedReport.radiusMeters}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/report/new')}
        testID="fab-new-report"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UVA_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
});
