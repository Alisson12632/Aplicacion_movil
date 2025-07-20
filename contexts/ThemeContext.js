import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setDarkMode(storedTheme === 'dark');
      } else {
        const colorScheme = Appearance.getColorScheme();
        setDarkMode(colorScheme === 'dark');
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
