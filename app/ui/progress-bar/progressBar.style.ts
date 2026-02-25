import { StyleSheet } from "react-native";
import type { ThemeTokens } from "@themes/theme";
/**
 * ProgressBar styles factory (theme-aware).
 */
export default function makeProgressBarStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.track,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
      width: "0%",
    },
  });
}
