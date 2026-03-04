import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import type { StylesOverride, ThemeTokens } from "@themes/theme";

/**
 * Shape structurelle du composant (uniquement des styles RN valides).
 */
export type ProgressBarShape = {
  // Linear
  linearWrapper: ViewStyle;
  track: ViewStyle;
  fill: ViewStyle;
  linearLabel: TextStyle;

  // Circular
  circleWrapper: ViewStyle;
  circleLabelContainer: ViewStyle;
  circleLabel: TextStyle;
};

export default function makeProgressBarStyles(theme: ThemeTokens): ProgressBarShape {
  return StyleSheet.create({
    // ----- Linear -----
    linearWrapper: {
      gap: 6,
    },
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.track,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },
    linearLabel: {
      fontSize: 12,
      opacity: 0.8,
      color: (theme.colors as any).text ?? theme.colors.primary,
      alignSelf: "flex-start",
    },

    // ----- Circular -----
    circleWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    circleLabelContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    circleLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: (theme.colors as any).text ?? theme.colors.primary,
    },
  });
}

export type ProgressBarStyles = StylesOverride<ProgressBarShape>;
