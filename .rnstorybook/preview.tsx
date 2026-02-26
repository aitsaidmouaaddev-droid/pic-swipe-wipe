import React from "react";
import { View, Button } from "react-native";
import { ThemeProvider, useTheme } from "@themes/ThemeContext";

const ThemeToggle = ({ children }: { children: React.ReactNode }) => {
  // 🎯 Destructure 'mode' directly from the context
  const { theme, toggleTheme, mode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          position: "absolute",
          top: 50,
          right: 20,
          zIndex: 999,
          backgroundColor: "rgba(255,255,255,0.2)", // Lighten background so it's visible in dark mode too
          borderRadius: 8,
        }}
      >
        <Button
          // 🎯 Use 'mode' directly instead of 'theme.mode'
          title={mode === "dark" ? "☀️ Light" : "🌙 Dark"}
          onPress={toggleTheme}
        />
      </View>
      {children}
    </View>
  );
};
// 2. The Decorator provides the context THEN renders the toggle
export const decorators = [
  (Story: React.ComponentType) => (
    <ThemeProvider>
      <ThemeToggle>
        <Story />
      </ThemeToggle>
    </ThemeProvider>
  ),
];
