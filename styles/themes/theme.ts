import type { StyleProp } from "react-native";

// This interface describes what a "theme" must contain.
// Any theme (dark, light, custom) must follow this shape.
export interface ThemeTokens {
  mode: "light" | "dark"; // Added mode for easier logic in components
  colors: {
    onSurface: string;
    shadow: string;
    background: string;
    surface: string; // Added for Cards/Sidebars
    text: string;
    mutedText: string;
    primary: string;
    secondary: string; // Renamed 'track' to 'secondary' for semantic clarity
    danger: string;
    success: string; // Added for the "Keep" swipe action
    border: string; // Added for the 'outline' button variant
    track: string; // Kept for backward compatibility with existing styles
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

/**
 * Override type: for each style key, allow any React Native style prop.
 * (works with ViewStyle/TextStyle/ImageStyle AND with StyleSheet IDs)
 */
export type StylesOverride<S> = Partial<Record<keyof S, StyleProp<any>>>;
