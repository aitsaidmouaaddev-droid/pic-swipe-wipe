import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ThemeTokens } from "./theme";
import { lightTheme } from "./light";
import { darkTheme } from "./dark";

interface ThemeContextType {
  theme: ThemeTokens;
  isDark: boolean;
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export default ThemeProvider;
