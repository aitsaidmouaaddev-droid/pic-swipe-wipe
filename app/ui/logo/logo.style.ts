import { StylesOverride, ThemeTokens } from "@styles/themes/theme";
import { StyleSheet, ViewStyle, ImageStyle } from "react-native";

/**
 * Configuration de l'animation par défaut.
 */
export interface LogoAnimationPreset {
  scaleFrom: number;
  scaleTo: number;
  duration: number;
}

export const defaultLogoAnimation: LogoAnimationPreset = {
  scaleFrom: 1,
  scaleTo: 1.05,
  duration: 1200,
};

/**
 * Shape structurelle du Logo.
 */
export type LogoShape = {
  container: ViewStyle;
  image: ImageStyle;
};

/**
 * Création des styles pour le Logo.
 * On retire "size" car il est injecté dynamiquement dans le composant.
 */
export default function makeLogoStyles(theme: ThemeTokens): LogoShape {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      // Styles thématiques (ex: une ombre ou un filtre)
      opacity: 1,
    },
  });
}

export type LogoStyles = StylesOverride<LogoShape>;
