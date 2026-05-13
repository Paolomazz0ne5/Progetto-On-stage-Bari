import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="minigiochi"
        options={{
          title: 'Minigiochi',
          tabBarIcon: ({ color }) => <FontAwesome5 name="gamepad" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="missioni"
        options={{
          title: 'Missioni',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="target" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="classifica"
        options={{
          title: 'Classifica',
          tabBarIcon: ({ color }) => <FontAwesome5 name="trophy" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
