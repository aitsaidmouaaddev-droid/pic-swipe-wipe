import { ThemeTokens } from "@styles/themes/theme";
import { StyleSheet } from "react-native";

/**
 * Button visual variants.
 * Added: 'danger' and 'outline'
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

/**
 * Button sizes.
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Icon position relative to label.
 */
export type ButtonIconPosition = "left" | "right" | "top" | "bottom";

/**
 * Creates themed styles for {@link Button}.
 */
export default function makeButtonStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },

    // sizes
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 14, paddingHorizontal: 20 },

    // variants
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.track },
    ghost: { backgroundColor: "transparent" },
    danger: { backgroundColor: theme.colors.danger },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },

    // disabled state
    disabled: { opacity: 0.5 },

    // text
    textBase: { fontSize: theme.typography.body, fontWeight: "600" },
    textOnPrimary: { color: theme.colors.background },
    textDefault: { color: theme.colors.text },
    textMuted: { color: theme.colors.mutedText },
    textDanger: { color: theme.colors.background }, // White text on red background
    textOutline: { color: theme.colors.primary },
  });
}

/**
 * Returns the appropriate text color style key based on variant.
 */
export function getButtonTextStyleKey(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return "textOnPrimary";
    case "danger":
      return "textDanger";
    case "outline":
      return "textOutline";
    case "secondary":
      return "textDefault";
    default:
      return "textMuted";
  }
}

/**
 * Returns the icon color for the given button variant.
 */
export function getButtonIconColor(theme: ThemeTokens, variant: ButtonVariant) {
  switch (variant) {
    case "primary":
    case "danger":
      return theme.colors.background;
    case "outline":
      return theme.colors.primary;
    case "secondary":
      return theme.colors.text;
    default:
      return theme.colors.mutedText;
  }
}

/**
 * Returns icon size based on button size.
 */
export function getButtonIconSize(size: ButtonSize) {
  if (size === "sm") return 18;
  if (size === "lg") return 22;
  return 20;
}

/**
 * Returns flex direction for the given icon position.
 */
export function getFlexDirection(pos: ButtonIconPosition) {
  if (pos === "left") return "row";
  if (pos === "right") return "row-reverse";
  if (pos === "top") return "column";
  return "column-reverse"; // bottom
}
