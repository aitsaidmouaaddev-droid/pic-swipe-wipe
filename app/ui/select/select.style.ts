/**
 * @file select.style.ts
 * @description Styles pour le Select avec positionnement dynamique.
 */
import { ThemeTokens } from "@themes/theme";
import { StyleSheet } from "react-native";

export const makeSelectStyles = (theme: ThemeTokens) => {
  const surface = theme.colors.surface ?? theme.colors.background ?? "white";
  const onSurface = theme.colors.onSurface ?? theme.colors.text ?? "#000";

  return StyleSheet.create({
    container: {
      width: "100%",
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: theme.colors.border || "rgba(0,0,0,0.1)",
      minHeight: 48,
    },
    triggerActive: {
      borderColor: theme.colors.primary,
    },
    triggerLabel: {
      fontSize: 16,
      color: onSurface,
      flex: 1,
    },
    overlay: {
      flex: 1,
      // On garde un overlay transparent pour détecter le clic extérieur
    },
    menu: {
      position: "absolute", // Indispensable pour l'alignement
      backgroundColor: surface,
      borderRadius: 8,
      shadowColor: theme.colors.shadow || "rgba(0,0,0,0.1)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      overflow: "hidden",
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    optionSelected: {
      backgroundColor: theme.colors.primary + "15",
    },
    optionText: {
      fontSize: 16,
      color: onSurface,
      flex: 1,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });
};
