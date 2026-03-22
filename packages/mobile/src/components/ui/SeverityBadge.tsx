import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SEVERITY_COLORS } from '../../lib/constants';

interface Props {
  severity: string;
}

export default function SeverityBadge({ severity }: Props) {
  const color = SEVERITY_COLORS[severity] || '#999';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
