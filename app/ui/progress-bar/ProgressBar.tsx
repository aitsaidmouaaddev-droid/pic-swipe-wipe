import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import React from "react";
import { View } from "react-native";
import makeProgressBarStyles, { ProgressBarStyles } from "./progressBar.style";

/**
 * Props for ProgressBar.
 */
export interface ProgressBarProps {
  /** Value between 0 and 1. */
  value: number;
  stylesOverride?: Partial<ProgressBarStyles>;
}

/**
 * Theme-aware progress bar.
 * Controlled component: parent provides value.
 */
export default function ProgressBar({ value, stylesOverride }: ProgressBarProps) {
  const { theme } = useTheme();
  const styles = useResultedStyle<ProgressBarStyles>(theme, makeProgressBarStyles, stylesOverride);

  const pct = Math.max(0, Math.min(value, 1)) * 100;

  return (
    <View style={styles.track} testID="progress-track">
      <View style={[styles.fill, { width: `${pct}%` }]} testID="progress-fill" />
    </View>
  );
}
