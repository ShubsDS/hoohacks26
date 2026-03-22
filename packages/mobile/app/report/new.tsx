import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Location from 'expo-location';
import ReportForm, {
  ReportFormData,
} from '../../src/components/reports/ReportForm';
import { useReportsStore } from '../../src/stores/reports.store';
import api from '../../src/lib/api';

export default function NewReportScreen() {
  const router = useRouter();
  const { addReport } = useReportsStore();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Location permission is needed to submit a report.',
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    })();
  }, []);

  const handleSubmit = async (data: ReportFormData) => {
    if (!coords) {
      Alert.alert('Error', 'Unable to determine your location.');
      return;
    }

    setLoading(true);
    try {
      const { data: report } = await api.post('/reports', {
        category: data.category,
        severity: data.severity,
        title: data.title,
        description: data.description || undefined,
        lat: coords.lat,
        lng: coords.lng,
        radiusMeters: data.radiusMeters,
      });

      addReport(report);
      Alert.alert('Report Submitted', 'Your report has been posted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit report';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Report' }} />
      <ReportForm onSubmit={handleSubmit} loading={loading} />
    </>
  );
}
