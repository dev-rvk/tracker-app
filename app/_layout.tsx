import { TrackerProvider } from "@/context/TrackerContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

import { useColorScheme } from "nativewind";

export default function Layout() {
  const { colorScheme } = useColorScheme();

  return (
    <TrackerProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </TrackerProvider>
  );
}
