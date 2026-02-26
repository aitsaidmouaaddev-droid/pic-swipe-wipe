import { ThemeTokens } from "./theme";

export const lightTheme: ThemeTokens = {
  mode: "light",
  colors: {
    background: "#F8FAFC", // Softer off-white
    surface: "#FFFFFF",
    text: "#0F172A", // Deep slate
    mutedText: "#64748B",
    primary: "#2563EB", // Modern Blue
    secondary: "#F1F5F9",
    danger: "#EF4444", // Punchy Red
    success: "#22C55E", // Forest Green
    border: "#E2E8F0",
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
