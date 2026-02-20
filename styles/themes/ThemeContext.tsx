import React, { createContext, useContext, useMemo, useState } from "react";
import { lightTheme } from "./light";
import { ThemeTokens } from "./theme";
import { darkTheme } from "./dark";

/**
 * This is the "shape" of what our ThemeContext will expose.
 * We expose:
 * - theme: the current tokens (colors, spacing, etc.)
 * - mode: "dark" or "light"
 * - setMode: function to switch themes later
 */
export interface ThemeContextValue {
  theme: ThemeTokens;
  mode: "dark" | "light";
  setMode: (mode: "dark" | "light") => void;
}

/**
 * Create the context.
 * Default value is only used if a component calls useTheme()
 * WITHOUT being wrapped in <ThemeProvider />.
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provider component.
 * It stores the current mode in state, and computes the theme object.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  /**
   * useMemo caches the theme object so it only recalculates
   * when "mode" changes.
   */
  const theme = useMemo(() => {
    return mode === "dark" ? darkTheme : lightTheme;
  }, [mode]);

  const value: ThemeContextValue = { theme, mode, setMode };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Custom hook to read ThemeContext safely.
 * If used outside ThemeProvider, it throws an error (good for debugging).
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}