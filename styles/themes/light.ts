import { ThemeTokens } from "./theme";

export const lightTheme: ThemeTokens = {
  mode: "light",
  colors: {
    // Base surfaces
    background: "#F4F6F8", // App background
    surface: "#FFFFFF", // Cards / inputs / dropdowns
    border: "#E2E8F0",

    // Text
    text: "#0F172A", // Primary text
    mutedText: "#64748B", // Secondary text
    onSurface: "#0F172A", // Text/icons on surfaces

    // Brand
    primary: "#2563EB", // Clean blue
    secondary: "#EEF2FF", // Light indigo background

    // Semantic
    danger: "#DC2626",
    success: "#16A34A",

    // Effects
    shadow: "rgba(15, 23, 42, 0.12)",

    // Component-specific
    track: "#CBD5E1",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },

  typography: {
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
  },
};
