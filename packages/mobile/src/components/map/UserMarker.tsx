import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { UVA_NAVY } from '../../constants/map';

interface Props {
  latitude: number;
  longitude: number;
}

export function UserMarker({ latitude, longitude }: Props) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      testID="user-marker"
    >
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(35, 45, 75, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: UVA_NAVY,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
