import { ThemeTokens } from "./theme";

export const darkTheme: ThemeTokens = {
  mode: "dark",
  colors: {
    background: "#020617", // True deep navy (looks amazing on AMOLED)
    surface: "#0F172A", // Lighter navy for cards
    text: "#F8FAFC",
    mutedText: "#94A3B8",
    primary: "#60A5FA", // Brighter blue for contrast
    secondary: "#1E293B",
    danger: "#F87171",
    success: "#4ADE80",
    border: "#334155",
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
