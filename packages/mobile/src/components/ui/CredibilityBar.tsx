import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  score: number;
}

export default function CredibilityBar({ score }: Props) {
  const max = 3.0;
  const percentage = Math.min(100, (score / max) * 100);
  const color =
    score < 0.5 ? '#FF3B30' : score < 1.5 ? '#FF9500' : '#4CD964';

  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.label, { color }]}>{score.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },
});
