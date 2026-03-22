import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../../lib/api';
import { Report } from '../../stores/reports.store';

interface Props {
  reportId: string;
  count: number;
  onConfirmed?: (updatedReport: Report) => void;
}

export default function ConfirmButton({
  reportId,
  count,
  onConfirmed,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (confirmed || loading) return;
    setLoading(true);
    try {
      // Send the confirmer's location so the report centroid can be updated
      let body: { lat?: number; lng?: number } = {};
      try {
        const loc = await Location.getCurrentPositionAsync({});
        body = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      } catch {
        // Location unavailable — confirm without location update
      }

      const { data: updatedReport } = await api.post(`/reports/${reportId}/confirm`, body);
      setConfirmed(true);
      setCurrentCount((prev) => prev + 1);
      onConfirmed?.(updatedReport);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to confirm';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, confirmed && styles.buttonConfirmed]}
      onPress={handleConfirm}
      disabled={confirmed || loading}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, confirmed && styles.textConfirmed]}>
        {confirmed
          ? `Confirmed (${currentCount})`
          : `I see this too (${currentCount})`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonConfirmed: {
    backgroundColor: '#E8F5E9',
  },
  text: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
  textConfirmed: {
    color: '#4CAF50',
  },
});
