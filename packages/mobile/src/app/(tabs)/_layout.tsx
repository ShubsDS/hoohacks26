import React from 'react';
import { Tabs } from 'expo-router';
import { UVA_NAVY, UVA_ORANGE } from '../../constants/map';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: UVA_ORANGE,
        tabBarInactiveTintColor: UVA_NAVY,
        tabBarStyle: { backgroundColor: '#FFF' },
        headerStyle: { backgroundColor: UVA_NAVY },
        headerTintColor: '#FFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarTestID: 'tab-map',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarTestID: 'tab-reports',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarTestID: 'tab-profile',
        }}
      />
    </Tabs>
  );
}
