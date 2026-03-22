import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, SeverityConfig, SeverityLevel } from '../../theme/tokens';

interface SeverityCardProps {
  level: SeverityLevel;
  category: string;
  title: string;
  detail: string;
  timestamp: string;
  onPress?: () => void;
}

export default function SeverityCard({
  level,
  category,
  title,
  detail,
  timestamp,
  onPress,
}: SeverityCardProps) {
  const config = SeverityConfig[level];
  const isP3 = level === 'P3';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderColor: config.borderColor,
          borderLeftWidth: config.borderLeftWidth,
          backgroundColor: config.backgroundColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Text style={[styles.badge, { color: config.labelColor }]}>
          {config.label}
        </Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      <Text
        style={[
          styles.title,
          isP3 && { fontFamily: Fonts.grotesk, opacity: 0.5, fontWeight: 'normal' },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {category ? (
        <Text style={styles.detail} numberOfLines={1}>
          {category}
        </Text>
      ) : null}

      {detail ? (
        <Text style={styles.detail} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 18,
    paddingRight: 14,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: 'normal',
  },
  timestamp: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  title: {
    fontFamily: Fonts.groteskBlack,
    fontSize: 13.5,
    color: Colors.textPrimary,
    lineHeight: 17,
    marginBottom: 3,
    fontWeight: 'normal',
  },
  detail: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
    fontWeight: 'normal',
  },
});
