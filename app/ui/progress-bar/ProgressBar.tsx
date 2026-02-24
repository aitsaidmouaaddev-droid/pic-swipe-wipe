import React from "react";
import { View } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeStyles from "./progressBar.style";

/**
 * Props for ProgressBar.
 */
export interface ProgressBarProps {
  /** Value between 0 and 1. */
  value: number;
}

/**
 * Theme-aware progress bar.
 * Controlled component: parent provides value.
 */
export default function ProgressBar({ value }: ProgressBarProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const pct = Math.max(0, Math.min(value, 1)) * 100;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}