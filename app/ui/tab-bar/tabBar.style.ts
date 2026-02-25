import { StyleSheet } from "react-native";
import { ThemeTokens } from "@themes/theme";

/**
 * Styles for {@link ApprovedScreen}.
 */
export default function makeTabBarStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,

      backgroundColor: theme.colors.background,
      borderColor: theme.colors.track,
      borderWidth: 1,

      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 12,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    },

    label: {
      fontSize: theme.typography.body,
    },
  });
}
