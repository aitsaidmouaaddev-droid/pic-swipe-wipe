import { StylesOverride, ThemeTokens } from "@themes/theme";
import { StyleSheet, ViewStyle } from "react-native";

/**
 * Shape structurelle de l'icône.
 */
export type IconShape = {
  /** Conteneur de l'icône (View) */
  container: ViewStyle;
  /** Propriétés spécifiques pour les icônes vectorielles */
  vectorIcon: {
    color: string;
  };
  /** Propriétés spécifiques pour les SVG */
  svgIcon: {
    fill: string;
    stroke?: string;
  };
};

/**
 * Création des styles pour l'atome Icon.
 */
export default function makeIconStyles(theme: ThemeTokens): IconShape {
  // Styles standards gérés par StyleSheet
  const flatStyles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return {
    ...flatStyles,
    vectorIcon: {
      color: theme.colors.text,
    },
    svgIcon: {
      fill: theme.colors.text,
    },
  };
}

export type IconStyles = StylesOverride<IconShape>;
