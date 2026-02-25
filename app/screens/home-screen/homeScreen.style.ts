import { ThemeTokens } from "@themes/theme";
import { StyleSheet } from "react-native";

/**
 * Styles for {@link HomeScreen}.
 */
export default function makeHomeScreenStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
    },
    subtitle: {
      marginTop: theme.spacing.sm,
      color: theme.colors.mutedText,
      fontSize: theme.typography.body,
    },
  });
}
