import { Slot } from "expo-router";
import { ThemeProvider } from "@themes/ThemeContext";
import { View } from "react-native";

/**
 * Root layout for the whole app.
 *
 * Purpose:
 * - Wraps every screen with global providers (ThemeProvider, later: store, i18n, etc.)
 * - Renders the active route via <Slot />
 */
export default function Layout() {
  return (
    <ThemeProvider>
      <View style={{ flex: 1, borderRadius: 0, overflow: "visible" }}>
        <Slot />
      </View>
    </ThemeProvider>
  );
}