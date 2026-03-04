import { StylesOverride, ThemeTokens } from "@themes/theme";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { IconStyles } from "@ui/icon/icon.style"; // ✅ Pour l'override profond

/**
 * Shape structurelle du Select.
 */
export type SelectShape = {
  container: ViewStyle;
  trigger: ViewStyle;
  triggerActive: ViewStyle;
  triggerLabel: TextStyle;
  overlay: ViewStyle;
  menu: ViewStyle;
  optionItem: ViewStyle;
  optionSelected: ViewStyle;
  optionText: TextStyle;
  optionTextSelected: TextStyle;
  /** ✅ Imbrication pour les icônes du Select (trigger et options) */
  icon: IconStyles;
};

/**
 * Factory de styles pour le composant Select.
 */
export default function makeSelectStyles(theme: ThemeTokens): SelectShape {
  const surface = theme.colors.surface ?? "white";
  const onSurface = theme.colors.onSurface ?? "#000";

  const flats = StyleSheet.create({
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
    },
    menu: {
      position: "absolute",
      backgroundColor: surface,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
      overflow: "hidden",
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    optionSelected: {
      backgroundColor: theme.colors.primary + "15", // 15% d'opacité
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

  return {
    ...flats,
    icon: {
      container: {
        marginRight: 12, // Gap par défaut pour les options
      },
    },
  };
}

export type SelectStyles = StylesOverride<SelectShape>;
