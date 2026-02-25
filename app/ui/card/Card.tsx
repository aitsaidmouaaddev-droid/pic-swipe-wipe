import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeCardStyles from "./card.style";

/**
 * Props for {@link Card}.
 */
export interface CardProps {
  /** Card content. */
  children: React.ReactNode;

  /** Optional style override (size/position/radius). */
  style?: ViewStyle | ViewStyle[];

  /**
   * Optional overlay renderer.
   * Deck can provide overlays (trash/approved) without Card knowing swipe logic.
   */
  renderOverlay?: () => React.ReactNode;
}

/**
 * Presentational Card component.
 *
 * Responsibilities:
 * - Layout + theming + shadow
 * - Render content + optional overlay layer
 *
 * NOT responsible for:
 * - gestures
 * - swipe progress
 * - deck stacking
 */
export default function Card({ children, style, renderOverlay }: CardProps) {
  const { theme } = useTheme();
  const styles = makeCardStyles(theme);

  return (
    <View style={[styles.base, style]}>
      <View style={styles.content}>{children}</View>
      {renderOverlay ? <View style={styles.overlayLayer}>{renderOverlay()}</View> : null}
    </View>
  );
}
