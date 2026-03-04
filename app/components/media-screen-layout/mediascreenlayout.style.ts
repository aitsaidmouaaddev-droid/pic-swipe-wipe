import { ThemeTokens } from "@themes/theme";
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { CardsDeckStyles } from "@ui/cards-deck/cardsDeck.style";
import { SelectStyles } from "@ui/select/select.style";

export type MediaScreenLayoutShape = {
  container: ViewStyle;
  deckContainer: CardsDeckStyles; // ✅ Override complet pour le deck
  headerOverlay: ViewStyle;
  selectWrapper: ViewStyle;
  mediaFull: ImageStyle;
  unsupported: ViewStyle;
  unsupportedText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
};

export default function makeMediaScreenStyles(theme: ThemeTokens): MediaScreenLayoutShape {
  // Styles "plats" pour le layout
  const flats = StyleSheet.create({
    container: {
      height: "100%",
      width: "100%",
      flex: 1,
      backgroundColor: "#000", // On force le noir pour une immersion média
    },
    headerOverlay: {
      position: "absolute",
      top: 50,
      right: 16,
      left: 16,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      zIndex: 100,
    },
    selectWrapper: {
      width: 160,
    },
    mediaFull: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    unsupported: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1A1A1A",
    },
    unsupportedText: {
      color: theme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: 32,
    },
    emptyText: {
      color: theme.colors.text,
      fontSize: 16,
      textAlign: "center",
    },
  });

  return {
    ...flats,
    // ✅ On définit l'override du Deck pour supprimer TOUS les arrondis
    deckContainer: {
      container: {
        flex: 1,
        borderRadius: 0,
      },
      card: {
        base: {
          borderRadius: 0,
          backgroundColor: "#000",
          shadowOpacity: 0, // Optionnel: retire l'ombre pour le plein écran
          elevation: 0,
        },
        content: {
          borderRadius: 0,
        },
        overlayLayer: {
          borderRadius: 0,
        },
      },
      // On peut aussi styliser les couches (layer) ici si besoin
      layer: {
        justifyContent: "center",
        alignItems: "center",
      },
    },
  };
}

/**
 * Override pour le Select (Utilisé dans le trigger du filtre)
 */
export const filterSelectOverride: SelectStyles = {
  trigger: {
    height: 45,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Légère transparence
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
};
