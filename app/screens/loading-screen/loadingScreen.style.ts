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
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 24,
      color: theme.colors.text,
      fontWeight: "700",
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.mutedText,
      textAlign: "center",
    },
    bottom: {
      width: "100%",
      marginTop: 16,
    },
    error: {
      marginTop: 10,
      color: theme.colors.danger ?? "red",
    },
  });
}
