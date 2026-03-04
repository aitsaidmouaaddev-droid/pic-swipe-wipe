import { ThemeTokens, StylesOverride } from "@themes/theme";
import { StyleSheet, ViewStyle } from "react-native";

export type CardShape = {
  base: ViewStyle;
  content: ViewStyle;
  overlayLayer: ViewStyle;
};

export default function makeCardStyles(theme: ThemeTokens): CardShape {
  return StyleSheet.create({
    base: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      // On évite les overflow: hidden ici si on veut des ombres portées
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      height: "100%",
      width: "100%",
    },
    content: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden", // Crucial pour que l'image respecte les arrondis
    },
    overlayLayer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      pointerEvents: "none", // L'overlay ne doit pas bloquer les touches
    },
  });
}

export type CardStyles = StylesOverride<CardShape>;
