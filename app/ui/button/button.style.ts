import { StylesOverride, ThemeTokens } from "@styles/themes/theme";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { IconStyles } from "@ui/icon/icon.style"; // ✅ Import pour l'imbrication

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonIconPosition = "left" | "right" | "top" | "bottom";

/**
 * Définition de la forme structurelle du bouton.
 */
export type ButtonShape = {
  base: ViewStyle;
  // Variantes de conteneur
  primary: ViewStyle;
  secondary: ViewStyle;
  ghost: ViewStyle;
  danger: ViewStyle;
  outline: ViewStyle;
  // Tailles
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  // Textes
  textBase: TextStyle;
  textOnPrimary: TextStyle;
  textDefault: TextStyle;
  textMuted: TextStyle;
  textDanger: TextStyle;
  textOutline: TextStyle;
  // État
  disabled: ViewStyle;
  // ✅ Imbrication pour l'atome Icon
  icon: IconStyles;
  content: ViewStyle;
};

export default function makeButtonStyles(theme: ThemeTokens): ButtonShape {
  const flatStyles = StyleSheet.create({
    base: {
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row", // Par défaut pour icône + texte
    },
    // Tailles
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 14, paddingHorizontal: 20 },

    // Variantes
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.track },
    ghost: { backgroundColor: "transparent" },
    danger: { backgroundColor: theme.colors.danger },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },

    disabled: { opacity: 0.5 },

    // Typographie
    textBase: {
      fontSize: theme.typography.body,
      fontWeight: "600",
    },
    textOnPrimary: { color: theme.colors.background },
    textDefault: { color: theme.colors.text },
    textMuted: { color: theme.colors.mutedText },
    textDanger: { color: theme.colors.background },
    textOutline: { color: theme.colors.primary },
  });

  return {
    ...flatStyles,
    // ✅ On définit la shape de l'icône par défaut pour le bouton
    icon: {
      container: {
        marginHorizontal: 4, // Petit espace entre icône et texte
      },
    },
    content: {
      alignItems: "center",
      justifyContent: "center",
    },
  };
}

/**
 * Helpers de logique (Inchangés mais exportés pour le composant)
 */
export function getButtonTextStyleKey(variant: ButtonVariant): keyof ButtonShape {
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

export type ButtonStyles = StylesOverride<ButtonShape>;
