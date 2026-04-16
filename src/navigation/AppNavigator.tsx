import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { HomeScreen, LiveMapScreen, StationsScreen, SettingsScreen, TrackTrainScreen, TrainDetailsScreen } from '../screens';
import { Colors, FontSize } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface TabIconProps {
  focused: boolean;
  icon: string;
}

function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TrainDetails" component={TrainDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🔍" />,
          }}
        />
        <Tab.Screen
          name="Track"
          component={TrackTrainScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🚂" />,
          }}
        />
        <Tab.Screen
          name="Map"
          component={LiveMapScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🗺️" />,
          }}
        />
        <Tab.Screen
          name="Stations"
          component={StationsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏢" />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙️" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
