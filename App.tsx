import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrainProvider } from './src/context/TrainContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <TrainProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </TrainProvider>
    </SafeAreaProvider>
  );
}
