import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Colors, Fonts, Spacing } from '../../theme/tokens';

interface CTAStripProps {
  campusPoliceNumber?: string;
  onSafeRoute?: () => void;
  onShareLocation?: () => void;
}

function CTAButton({
  label,
  isPrimary,
  onPress,
}: {
  label: string;
  isPrimary?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, isPrimary && styles.buttonPrimary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconCircle,
          isPrimary
            ? { borderColor: Colors.gold }
            : { borderColor: Colors.textSecondary },
        ]}
      />
      <Text
        style={[
          styles.label,
          isPrimary ? { color: Colors.gold } : { color: Colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CTAStrip({
  campusPoliceNumber = '4349242511',
  onSafeRoute,
  onShareLocation,
}: CTAStripProps) {
  const handleSOS = () => {
    Alert.alert(
      'Emergency Call',
      'Call 911?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
      ],
    );
  };

  const handleCallPolice = () => {
    Linking.openURL(`tel:${campusPoliceNumber}`);
  };

  return (
    <View style={styles.container}>
      <CTAButton label="SOS" isPrimary onPress={handleSOS} />
      <CTAButton label="CALL POLICE" onPress={handleCallPolice} />
      <CTAButton label="SAFE ROUTE" onPress={onSafeRoute ?? (() => {})} />
      <CTAButton label="SHARE LOC" onPress={onShareLocation ?? (() => {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
    backgroundColor: Colors.bg,
  },
  button: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCTASecondary,
    borderRightWidth: 1,
    borderRightColor: 'rgba(240,232,213,0.07)',
    gap: 4,
  },
  buttonPrimary: {
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  label: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    fontWeight: 'normal',
  },
});
