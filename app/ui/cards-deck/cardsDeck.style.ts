import type { StylesOverride, ThemeTokens } from "@themes/theme";
import { StyleSheet, ViewStyle } from "react-native";
import { CardStyles } from "@ui/card/card.style";

export type CardsDeckShape = {
  container: ViewStyle;
  deck: ViewStyle;
  layer: ViewStyle;
  card: CardStyles; // Objet imbriqué (base, content, overlay, etc.)
  overlayCommon: ViewStyle;
  overlayLeft: ViewStyle;
  overlayRight: ViewStyle;
  fillLeft: ViewStyle;
  fillRight: ViewStyle;
};

export default function makeCardsDeckStyles(theme: ThemeTokens): CardsDeckShape {
  // 1. On crée les styles "plats" via StyleSheet pour la performance et la validation
  const flatStyles = StyleSheet.create({
    container: {
      flex: 1,
      height: "100%",
      width: "100%",
      backgroundColor: "transparent", // On laisse le fond transparent pour que les cartes gèrent leur propre background
    },
    deck: {
      flex: 1,
      position: "relative",
    },
    layer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent", // Important pour que les ombres des cartes soient visibles
    },
    overlayCommon: {
      position: "absolute",
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    overlayLeft: {
      left: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    overlayRight: {
      right: 0,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    fillLeft: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
    },
    fillRight: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
    },
  });

  // 2. On retourne l'objet complet en y injectant l'objet card (non géré par StyleSheet)
  return {
    ...flatStyles,
    card: {
      base: {
        width: "100%",
        height: "100%",
        backgroundColor: "transparent", // Optionnel : valeur par défaut
      },
      // Tu peux ajouter ici d'autres clés de CardStyles si nécessaire (overlay, content...)
    },
  };
}

export type CardsDeckStyles = StylesOverride<CardsDeckShape>;
