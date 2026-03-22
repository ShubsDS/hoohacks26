import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../theme/tokens';

type NavItem = 'feed' | 'map' | 'sos' | 'profile';

interface MonographNavBarProps {
  activeTab: NavItem;
  onTabPress: (tab: NavItem) => void;
}

export default function MonographNavBar({
  activeTab,
  onTabPress,
}: MonographNavBarProps) {
  const insets = useSafeAreaInsets();

  const tabs: { key: NavItem; label: string }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'map', label: 'Map' },
    { key: 'sos', label: 'SOS' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {tabs.map((tab) => {
        const isSOS = tab.key === 'sos';
        const isActive = activeTab === tab.key;

        const labelColor = isSOS
          ? Colors.navSOS
          : isActive
          ? Colors.navActive
          : Colors.navInactive;

        const pipColor = isSOS ? Colors.navSOS : labelColor;
        const pipBg = isSOS ? 'rgba(238,74,47,0.15)' : 'transparent';
        const pipOpacity = isSOS || isActive ? 1.0 : 0.6;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.pip,
                {
                  borderColor: pipColor,
                  backgroundColor: pipBg,
                  opacity: pipOpacity,
                },
              ]}
            />
            <Text
              style={[
                isSOS ? styles.labelSOS : styles.label,
                { color: labelColor },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.navBg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderNavTop,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 9,
    letterSpacing: 0.9,
    fontWeight: 'normal',
  },
  labelSOS: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: 'normal',
  },
});
