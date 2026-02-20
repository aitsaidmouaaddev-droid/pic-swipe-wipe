import { ThemeTokens } from "@themes/theme";
import { StyleSheet } from "react-native";

/**
 * Creates themed styles for {@link LoadingScreen}.
 */
export default function makeLoadingScreenStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },

    title: {
      fontSize: theme.typography.title,
      color: theme.colors.text,
    },

    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.mutedText,
    },

    barTrack: {
      width: "100%",
      height: 10,
      backgroundColor: theme.colors.track,
      borderRadius: theme.radius.pill,
      overflow: "hidden",
      marginTop: theme.spacing.md,
    },

    barFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
    },
  });
}