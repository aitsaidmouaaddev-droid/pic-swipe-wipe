import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { ThemeTokens } from "./theme";
import { lightTheme } from "./light";
import { darkTheme } from "./dark";

/**
 * Defines the shape of the Theme Context state.
 */
interface ThemeContextType {
  /** The current active theme object containing colors, spacing, etc. */
  theme: ThemeTokens;
  /** A boolean flag indicating if the current mode is dark. */
  isDark: boolean;
  /** Function to switch between light and dark modes. */
  toggleTheme: () => void;
  /** The name of the current mode ('light' | 'dark'). */
  mode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider component that wraps your app to provide theme state.
 * * This provider manages the switching logic between light and dark themes
 * and persists the choice during the app session.
 *
 * @param children - The component tree to be wrapped.
 * @returns A Context Provider wrapping the provided children.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  /**
   * Toggles the theme mode between 'light' and 'dark'.
   */
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "dark"));
  };

  /**
   * Memoized theme object to prevent unnecessary re-renders of consuming components.
   */
  const value = useMemo(
    () => ({
      theme: mode === "light" ? lightTheme : darkTheme,
      isDark: mode === "dark",
      toggleTheme,
      mode,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Custom hook to access the current theme and toggle functionality.
 * * @throws Error if used outside of a {@link ThemeProvider}.
 * @returns The {@link ThemeContextType} object.
 * * @example
 * const { theme, toggleTheme } = useTheme();
 * return <View style={{ backgroundColor: theme.colors.background }} />
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
