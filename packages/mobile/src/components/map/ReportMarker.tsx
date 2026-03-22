import React from 'react';
import { Marker } from 'react-native-maps';
import { Report } from '@hoohacks26/shared';
import { CATEGORY_COLORS } from '../../constants/map';

interface Props {
  report: Report;
  onPress: () => void;
}

export function ReportMarker({ report, onPress }: Props) {
  const color = CATEGORY_COLORS[report.category];

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      pinColor={color}
      onPress={onPress}
      testID={`report-marker-${report.id}`}
      title={report.title}
      description={report.category}
    />
  );
}
