// This interface describes what a "theme" must contain.
// Any theme (dark, light, custom) must follow this shape.
export interface ThemeTokens {
  mode: "light" | "dark"; // Added mode for easier logic in components
  colors: {
    background: string;
    surface: string; // Added for Cards/Sidebars
    text: string;
    mutedText: string;
    primary: string;
    secondary: string; // Renamed 'track' to 'secondary' for semantic clarity
    danger: string;
    success: string; // Added for the "Keep" swipe action
    border: string; // Added for the 'outline' button variant
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  typography: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
}

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
