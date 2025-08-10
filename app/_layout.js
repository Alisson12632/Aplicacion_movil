import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';  
import { Slot } from 'expo-router';

function InnerLayout() {
  const { darkMode } = useTheme();

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
      <Slot />
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>   
        <InnerLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkBackground: {
    backgroundColor: '#0D1B2A',
  },
  lightBackground: {
    backgroundColor: '#388b3cff',
  },
});
