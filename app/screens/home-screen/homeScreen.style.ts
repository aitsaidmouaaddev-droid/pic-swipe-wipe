import { ThemeTokens } from "@themes/theme";
import { Platform, StyleSheet, ViewStyle } from "react-native";

export default function makeHomeScreenStyles(theme: ThemeTokens) {
  return {
    // Garde tes styles UI ici
    ui: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      // ... tes autres styles (deckContainer, card, etc.)
    }),

    overlayContainer: {
      ...StyleSheet.absoluteFillObject,
      // We remove horizontal padding here to allow children
      // to pin exactly to edges if needed
    } as ViewStyle,

    filterContainer: {
      position: "absolute" as const,
      top: Platform.OS === "ios" ? 60 : 40,
      right: 20,
      zIndex: 10,
    } as ViewStyle,

    filterStyles: {
      borderRadius: 50,
      width: 54,
      height: 54,
      backgroundColor: theme.colors.background + "CC",
    } as ViewStyle,

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
