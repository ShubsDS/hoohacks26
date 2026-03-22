import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Colors, Fonts } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'rgba(220,195,140,0.90)',
        tabBarInactiveTintColor: 'rgba(220,195,140,0.28)',
        tabBarStyle: {
          backgroundColor: Colors.navBg,
          borderTopColor: Colors.borderNavTop,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.cormorantItalic,
          fontSize: 9,
          letterSpacing: 0.9,
          fontWeight: 'normal' as const,
        },
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontFamily: Fonts.cormorantBold,
          fontWeight: 'normal' as const,
          fontSize: 20,
          color: Colors.textPrimary,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 16, height: 16, borderRadius: 8,
              borderWidth: 1,
              borderColor: focused ? 'rgba(220,195,140,0.90)' : 'rgba(220,195,140,0.28)',
              opacity: focused ? 1 : 0.6,
            }} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 16, height: 16, borderRadius: 8,
              borderWidth: 1,
              borderColor: focused ? 'rgba(220,195,140,0.90)' : 'rgba(220,195,140,0.28)',
              opacity: focused ? 1 : 0.6,
            }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 16, height: 16, borderRadius: 8,
              borderWidth: 1,
              borderColor: focused ? 'rgba(220,195,140,0.90)' : 'rgba(220,195,140,0.28)',
              opacity: focused ? 1 : 0.6,
            }} />
          ),
        }}
      />
    </Tabs>
  );
}
