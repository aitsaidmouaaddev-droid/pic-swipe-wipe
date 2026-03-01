import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { StylesOverride, ThemeTokens } from "@themes/theme";
import { IconStyles } from "@ui/icon/icon.style"; // ✅ Pour piloter les icônes des onglets

/**
 * Shape structurelle de la TabBar.
 */
export type TabBarShape = {
  /** Conteneur principal (souvent flottant) */
  container: ViewStyle;
  /** Zone tactile de l'onglet */
  item: ViewStyle;
  /** Conteneur interne (Icon + Label) */
  itemContent: ViewStyle;
  /** Texte de l'onglet */
  label: TextStyle;
  /** État actif pour le label */
  labelActive: TextStyle;
  /** ✅ Imbrication pour les icônes des onglets */
  icon: IconStyles;
};

/**
 * Factory de styles pour la TabBar.
 */
export default function makeTabBarStyles(theme: ThemeTokens): TabBarShape {
  const flats = StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 24, // Un peu plus d'espace pour le look "floating"

      backgroundColor: theme.colors.background,
      borderColor: theme.colors.track,
      borderWidth: 1,

      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 12,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      // Shadow pour l'effet flottant
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },

    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 999,
    },

    itemContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: 4, // Espace entre icône et texte
    },

    label: {
      fontSize: 12, // Tab labels sont souvent plus petits
      color: theme.colors.mutedText,
      fontWeight: "500",
    },

    labelActive: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
  });

  return {
    ...flats,
    icon: {
      container: {
        // Style par défaut de l'icône dans la tab
      },
    },
  };
}

export type TabBarStyles = StylesOverride<TabBarShape>;
