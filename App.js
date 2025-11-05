import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import LandingScreen from './components/LandingScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <LandingScreen />
      </SafeAreaView>
    </>
  );
}
