import { TrackerProvider } from "@/context/TrackerContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function Layout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Web-specific: Sync dark class to document and persist to localStorage
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Apply dark class to root element
      if (colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      // Persist to localStorage
      localStorage.setItem('color-scheme', colorScheme || 'light');
    }
  }, [colorScheme]);

  // Web-specific: Restore color scheme from localStorage on mount
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const stored = localStorage.getItem('color-scheme');
      if (stored === 'dark' || stored === 'light') {
        setColorScheme(stored);
        // Also apply immediately to prevent flash
        if (stored === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    }
  }, []);

  return (
    <TrackerProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </TrackerProvider>
  );
}
