import { ThemeTokens } from "@themes/theme";
import { StyleSheet } from "react-native";

/**
 * Configuration for the Logo scale animation.
 */
export interface LogoAnimationPreset {
  /** Starting scale value. */
  scaleFrom: number;

  /** Ending scale value. */
  scaleTo: number;

  /** Duration in milliseconds for each phase. */
  duration: number;
}

/**
 * Default animation preset used by {@link Logo}.
 */
export const defaultLogoAnimation: LogoAnimationPreset = {
  scaleFrom: 1,
  scaleTo: 1.05,
  duration: 1200,
};

/**
 * Creates styles for {@link Logo} using theme tokens.
 */
export default function makeLogoStyles(theme: ThemeTokens, size: number) {
  return StyleSheet.create({
    logo: {
      width: size,
      height: size,
    },
  });
}