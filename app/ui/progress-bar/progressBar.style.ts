import { StyleSheet, ViewStyle } from "react-native";
import type { StylesOverride, ThemeTokens } from "@themes/theme";

/**
 * Shape structurelle de la barre de progression.
 */
export type ProgressBarShape = {
  /** Le conteneur (fond gris par défaut) */
  track: ViewStyle;
  /** La partie colorée qui progresse */
  fill: ViewStyle;
};

/**
 * ProgressBar styles factory (theme-aware).
 */
export default function makeProgressBarStyles(theme: ThemeTokens): ProgressBarShape {
  return StyleSheet.create({
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.track,
      overflow: "hidden", // Crucial pour que le fill respecte l'arrondi du track
    },
    fill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
      // La largeur (width) est omise ici car elle est gérée par les props/animation
    },
  });
}

export type ProgressBarStyles = StylesOverride<ProgressBarShape>;
