import React from 'react';
import { Circle } from 'react-native-maps';

interface Props {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  strokeColor?: string;
  fillColor?: string;
}

export function RadiusCircle({
  latitude,
  longitude,
  radiusMeters,
  strokeColor = 'rgba(229, 114, 0, 0.8)',
  fillColor = 'rgba(229, 114, 0, 0.15)',
}: Props) {
  return (
    <Circle
      center={{ latitude, longitude }}
      radius={radiusMeters}
      strokeColor={strokeColor}
      strokeWidth={2}
      fillColor={fillColor}
      testID="radius-circle"
    />
  );
}
