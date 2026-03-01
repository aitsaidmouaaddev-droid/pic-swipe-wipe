import { StyleSheet } from "react-native";
import { ThemeTokens } from "@themes/theme";

/**
 * Styles for {@link ApprovedScreen}.
 */
export default function makeApprovedScreenStyles(theme: ThemeTokens) {
  return {
    // Garde tes styles UI ici
    ui: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      // ... tes autres styles (deckContainer, card, etc.)
    }),

    // Définition des styles pour les actions de swipe
    actions: {
      left: {
        color: theme.colors.danger || "#ff3b30",
        iconName: "trash" as const,
      },
      right: {
        color: theme.colors.success || "#34c759",
        iconName: "checkmark-circle" as const,
      },
    },
  };
}
