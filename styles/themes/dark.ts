import { ThemeTokens } from "./theme";

export const darkTheme: ThemeTokens = {
  mode: "dark",
  colors: {
    // Base surfaces
    background: "#0B1220", // Deep blue-black
    surface: "#111827", // Card layer
    border: "#1F2937",

    // Text
    text: "#F1F5F9", // Primary text
    mutedText: "#94A3B8",
    onSurface: "#F1F5F9",

    // Brand
    primary: "#3B82F6", // Softer bright blue
    secondary: "#1E293B",

    // Semantic
    danger: "#F87171",
    success: "#34D399",

    // Effects
    shadow: "rgba(0, 0, 0, 0.6)",

    // Component-specific
    track: "#334155",
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
