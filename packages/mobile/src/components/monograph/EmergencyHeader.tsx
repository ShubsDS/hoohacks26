import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '../../theme/tokens';

interface EmergencyHeaderProps {
  alertLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
  activePips: number;
  criticalPips?: number;
  warningPips?: number;
}

export default function EmergencyHeader({
  alertLevel,
  activePips,
  criticalPips = 0,
  warningPips = 0,
}: EmergencyHeaderProps) {
  const insets = useSafeAreaInsets();

  const getPipColor = (index: number) => {
    if (index >= activePips) return 'rgba(240,232,213,0.25)';
    if (index < criticalPips) return Colors.severityCritical;
    if (index < criticalPips + warningPips) return Colors.gold;
    return Colors.textPrimary;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Diagonal stripes overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stripe,
              {
                left: -40 + i * 14,
                transform: [{ rotate: '-55deg' }],
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.systemLabel}>HOOSALERT SYSTEM</Text>
      <Text style={styles.title}>Active</Text>
      <Text style={styles.subtitle}>campus incident monitor</Text>

      {/* Alert level bar */}
      <View style={styles.alertBar}>
        <View style={styles.alertBarInner}>
          <View>
            <Text style={styles.alertLabel}>ALERT LEVEL</Text>
            <Text style={styles.alertValue}>{alertLevel}</Text>
          </View>
          <View style={styles.pipsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.pip, { backgroundColor: getPipColor(i) }]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerRed,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: -100,
    width: 1,
    height: 500,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  systemLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xl,
    marginBottom: 2,
    fontWeight: 'normal',
  },
  title: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 30,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    fontWeight: 'normal',
  },
  subtitle: {
    fontFamily: Fonts.cormorantLightItalic,
    fontSize: 18,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    fontWeight: 'normal',
  },
  alertBar: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderNavTop,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  alertBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    color: Colors.textSecondary,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    fontWeight: 'normal',
  },
  alertValue: {
    fontFamily: Fonts.cormorantBold,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  pipsRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  pip: {
    width: 18,
    height: 7,
    borderRadius: 1,
  },
});
