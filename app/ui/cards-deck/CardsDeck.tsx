/**
 * @file CardsDeck.tsx
 * @description Composant de deck de cartes agnostique.
 * Gère les animations de swipe gauche/droite et les overlays visuels.
 * Seul le mouvement physique compte : Left = X négatif, Right = X positif.
 */
import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import Card from "@ui/card/Card";
import Icon from "@ui/icon/Icon";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, View, type LayoutChangeEvent } from "react-native";
import makeCardsDeckStyles, { CardsDeckStyles } from "./cardsDeck.style";

export type SwipeDirection = "left" | "right";

export interface SwipeProgressInfo {
  dx: number;
  progress: number;
  direction: SwipeDirection;
}

export interface SwipeActionVisual {
  color: string;
  icon: any;
  widthRatio?: number;
  iconSize?: number;
  iconColor?: string;
}

export interface CardsDeckProps<TFront, TBack = TFront> {
  stylesOverride?: Partial<CardsDeckStyles>;
  frontItem: TFront;
  backItem?: TBack;
  renderFront: (item: TFront) => React.ReactNode;
  renderBack?: (item: TBack) => React.ReactNode;
  resetKey?: any;
  swipeAutoCommitThresholdRatio?: number;
  overlayMaxWidthRatio?: number;
  overlayMaxOpacity?: number;
  onSwipeCommit?: (direction: SwipeDirection) => void;
  onSwipeCancel?: () => void;
  onSwipeProgress?: (info: SwipeProgressInfo) => void;
  /** Action déclenchée par un swipe vers la GAUCHE (X négatif) */
  leftAction?: SwipeActionVisual;
  /** Action déclenchée par un swipe vers la DROITE (X positif) */
  rightAction?: SwipeActionVisual;
  backCardDepthEffect?: boolean;
  backCardScale?: number;
}

export default function CardsDeck<TFront, TBack = TFront>({
  stylesOverride,
  frontItem,
  backItem,
  renderFront,
  renderBack,
  onSwipeProgress,
  swipeAutoCommitThresholdRatio = 0.3,
  overlayMaxWidthRatio = 0.3,
  overlayMaxOpacity = 0.7,
  onSwipeCommit,
  onSwipeCancel,
  leftAction,
  rightAction,
  backCardScale = 0.985,
  backCardDepthEffect = true,
  resetKey,
}: CardsDeckProps<TFront, TBack>) {
  const { theme } = useTheme();
  const styles = useResultedStyle<CardsDeckStyles>(theme, makeCardsDeckStyles, stylesOverride);

  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(1);

  const isCommittingRef = useRef(false);
  const committedThisGestureRef = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width || 1);
  };

  const commitPx = width * swipeAutoCommitThresholdRatio;

  // Calcul des largeurs d'overlay basées sur les ratios fournis
  const leftOverlayWidthPx = width * Math.min(leftAction?.widthRatio ?? overlayMaxWidthRatio, 0.5);
  const rightOverlayWidthPx =
    width * Math.min(rightAction?.widthRatio ?? overlayMaxWidthRatio, 0.5);

  // Reset de la position lors du changement de clé (nouvel item)
  useEffect(() => {
    translateX.stopAnimation(() => translateX.setValue(0));
    isCommittingRef.current = false;
    committedThisGestureRef.current = false;
  }, [resetKey, translateX]);

  /**
   * Animation de sortie de la carte
   */
  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (isCommittingRef.current || committedThisGestureRef.current) return;

      isCommittingRef.current = true;
      committedThisGestureRef.current = true;

      const toX = direction === "left" ? -width * 1.3 : width * 1.3;

      Animated.timing(translateX, {
        toValue: toX,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onSwipeCommit?.(direction);
        // Le reset de translateX se fera via le useEffect du resetKey
      });
    },
    [width, translateX, onSwipeCommit],
  );

  /**
   * Configuration du PanResponder avec verrouillage de direction
   */
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderGrant: () => {
        committedThisGestureRef.current = false;
      },
      onPanResponderMove: (_, g) => {
        if (isCommittingRef.current || committedThisGestureRef.current) return;

        const isSwipingLeft = g.dx < 0;
        const isSwipingRight = g.dx > 0;

        // 🔒 VERROUILLAGE PHYSIQUE : Si la direction n'a pas d'action, on bloque le mouvement
        if ((isSwipingLeft && !leftAction) || (isSwipingRight && !rightAction)) {
          translateX.setValue(0);
          return;
        }

        const direction: SwipeDirection = isSwipingLeft ? "left" : "right";
        const progress = Math.min(Math.abs(g.dx) / (commitPx || 1), 1);

        onSwipeProgress?.({ dx: g.dx, progress, direction });

        // Seuil d'auto-commit atteint
        if (Math.abs(g.dx) >= commitPx) {
          commitSwipe(direction);
          return;
        }

        translateX.setValue(g.dx);
      },
      onPanResponderRelease: () => {
        if (isCommittingRef.current || committedThisGestureRef.current) return;

        Animated.spring(translateX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start(() => onSwipeCancel?.());
      },
    });
  }, [commitPx, commitSwipe, onSwipeCancel, onSwipeProgress, translateX, leftAction, rightAction]);

  // --- INTERPOLATIONS AGNOSTIQUES ---

  // Opacité pour l'action de GAUCHE (activée par un mouvement vers la GAUCHE)
  const leftOpacity = translateX.interpolate({
    inputRange: [-commitPx, 0],
    outputRange: [overlayMaxOpacity, 0],
    extrapolate: "clamp",
  });

  // Opacité pour l'action de DROITE (activée par un mouvement vers la DROITE)
  const rightOpacity = translateX.interpolate({
    inputRange: [0, commitPx],
    outputRange: [0, overlayMaxOpacity],
    extrapolate: "clamp",
  });

  // Effet de zoom sur la carte arrière
  const backScale = translateX.interpolate({
    inputRange: [-commitPx, 0, commitPx],
    outputRange: [1, backCardDepthEffect ? backCardScale : 1, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.deck}>
        {/* CARTE ARRIÈRE (Prévisualisation) */}
        {backItem !== undefined && (
          <Animated.View style={[styles.layer, { transform: [{ scale: backScale }] }]}>
            <Card stylesOverride={styles.card}>{renderBack ? renderBack(backItem) : null}</Card>
          </Animated.View>
        )}

        {/* CARTE AVANT (Interactive) */}
        <Animated.View
          testID="deck-front-card"
          style={[styles.layer, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Card
            stylesOverride={styles.card}
            renderOverlay={() => (
              <>
                {/* Overlay GAUCHE (ex: Trash dans Home) */}
                {leftAction && (
                  <Animated.View
                    style={[
                      styles.overlayCommon,
                      styles.overlayRight, // Apparaît sur le bord droit quand on pousse vers la gauche
                      { width: leftOverlayWidthPx, opacity: leftOpacity },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.fillRight,
                        {
                          width: leftOverlayWidthPx,
                          backgroundColor: leftAction.color,
                          transform: [
                            {
                              translateX: translateX.interpolate({
                                inputRange: [-commitPx, 0],
                                outputRange: [0, leftOverlayWidthPx],
                                extrapolate: "clamp",
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Icon
                      {...leftAction.icon}
                      size={leftAction.iconSize ?? 32}
                      color={leftAction.iconColor ?? "#FFF"}
                    />
                  </Animated.View>
                )}

                {/* Overlay DROIT (ex: Keep dans Home ou Restore dans Trash) */}
                {rightAction && (
                  <Animated.View
                    style={[
                      styles.overlayCommon,
                      styles.overlayLeft, // Apparaît sur le bord gauche quand on pousse vers la droite
                      { width: rightOverlayWidthPx, opacity: rightOpacity },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.fillLeft,
                        {
                          width: rightOverlayWidthPx,
                          backgroundColor: rightAction.color,
                          transform: [
                            {
                              translateX: translateX.interpolate({
                                inputRange: [0, commitPx],
                                outputRange: [-rightOverlayWidthPx, 0],
                                extrapolate: "clamp",
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Icon
                      {...rightAction.icon}
                      size={rightAction.iconSize ?? 32}
                      color={rightAction.iconColor ?? "#FFF"}
                    />
                  </Animated.View>
                )}
              </>
            )}
          >
            {renderFront(frontItem)}
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}
