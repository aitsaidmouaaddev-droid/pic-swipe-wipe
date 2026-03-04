import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import React from "react";
import { View } from "react-native";
import makeCardStyles, { CardStyles } from "./card.style";

/**
 * Props for {@link Card}.
 */
export interface CardProps {
  /** Card content. */
  children: React.ReactNode;

  /** ✅ Système d'override typé pour base, content et overlayLayer */
  stylesOverride?: Partial<CardStyles>;

  /**
   * Optional overlay renderer.
   * Deck can provide overlays (trash/approved) without Card knowing swipe logic.
   */
  renderOverlay?: () => React.ReactNode;
}

/**
 * Presentational Card component.
 * Totalement "dumb" : il ne gère que l'affichage et les styles résultants.
 */
export default function Card({ children, stylesOverride, renderOverlay }: CardProps) {
  const { theme } = useTheme();

  // ✅ On génère les styles finaux (Fusion Thème + Overrides)
  const styles = useResultedStyle<CardStyles>(theme, makeCardStyles, stylesOverride);

  return (
    <View style={styles.base}>
      {/* Conteneur du contenu (Image, Vidéo, etc.) */}
      <View style={styles.content}>{children}</View>

      {/* Couche d'overlay (Filtres de couleur Trash/Approved) */}
      {renderOverlay && <View style={styles.overlayLayer}>{renderOverlay()}</View>}
    </View>
  );
}
