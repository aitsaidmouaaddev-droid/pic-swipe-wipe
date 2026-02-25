import { StyleSheet } from "react-native";
import type { ThemeTokens } from "@themes/theme";

/**
 * Creates themed styles for {@link CardsDeck}.
 */
export default function makeCardsDeckStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    /**
     * Deck container must receive size from parent (usually flex: 1 on screen).
     */
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    /**
     * Holds stacked absolute layers.
     */
    deck: {
      flex: 1,
    },

    /**
     * Absolute fill layer for each stacked card.
     */
    layer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    /**
     * Shared overlay position style.
     */
    overlayCommon: {
      position: "absolute",
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    revealClip: {
      overflow: "hidden",
    },
  });
}
