import { StyleSheet } from "react-native";
import type { ThemeTokens } from "@themes/theme";


/**
 * Creates themed styles for {@link Card}.
 */
export default function makeCardStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 0,
      borderColor: theme.colors.track,

      // iOS shadow
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },

      // Android shadow
      elevation: 8,

      overflow: "hidden",
    },
    content: { flex: 1 },
    overlayLayer: {
      ...StyleSheet.absoluteFillObject,
      pointerEvents: "none",
    },
  });
}