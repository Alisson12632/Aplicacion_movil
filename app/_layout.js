import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { useTheme, ThemeProvider } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Slot } from 'expo-router';

function InnerLayout() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
      <View style={styles.switchContainer}>
      </View>
      <Slot />
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <InnerLayout />  {/* Aquí se renderizan todas las pantallas con <Slot /> */}
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
switchOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  paddingTop: 10,      
  paddingLeft: 16,   
  zIndex: 999,        
  backgroundColor: 'transparent', 
},





});


