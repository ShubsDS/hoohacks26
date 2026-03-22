import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UVA_NAVY } from '../../constants/map';

// Stub — Dev 3 will replace this with the full profile screen
export default function ProfileScreen() {
  return (
    <View style={styles.container} testID="profile-stub">
      <Text style={styles.text}>Profile — Coming Soon (Dev 3)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: UVA_NAVY, fontSize: 16 },
});
