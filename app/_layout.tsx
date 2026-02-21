import { Slot } from "expo-router";
import { ThemeProvider } from "@themes/ThemeContext";

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
      <Slot />
    </ThemeProvider>
  );
}