import { Slot } from "expo-router";
import { ThemeProvider } from "@themes/ThemeContext";

export default function Layout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}