import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Animated, PanResponder, View, type LayoutChangeEvent } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeCardsDeckStyles, { CardsDeckStyles } from "./cardsDeck.style";
import Card from "@ui/card/Card";
import Icon from "@ui/icon/Icon";
import { useResultedStyle } from "@hooks/useResultedStyle.hook";

export type SwipeDirection = "left" | "right";

export interface SwipeProgressInfo {
  dx: number;
  progress: number;
  direction: SwipeDirection;
}

export interface SwipeActionVisual {
  color: string;
  icon: any; // IconProps
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
  leftAction?: SwipeActionVisual;
  rightAction?: SwipeActionVisual;
  backCardDepthEffect?: boolean;
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
  backCardDepthEffect = true,
  resetKey,
}: CardsDeckProps<TFront, TBack>) {
  const { theme } = useTheme();

  // ✅ On utilise useResultedStyle pour tout piloter par l'override
  const styles = useResultedStyle<CardsDeckStyles>(theme, makeCardsDeckStyles, stylesOverride);

  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(1);

  const isCommittingRef = useRef(false);
  const committedThisGestureRef = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width || 1);
  };

  // --- Calculs de Layout ---
  const commitPx = width * swipeAutoCommitThresholdRatio;
  const leftOverlayWidthPx = width * Math.min(leftAction?.widthRatio ?? overlayMaxWidthRatio, 0.5);
  const rightOverlayWidthPx =
    width * Math.min(rightAction?.widthRatio ?? overlayMaxWidthRatio, 0.5);

  // --- RESET Effect ---
  useEffect(() => {
    translateX.stopAnimation(() => translateX.setValue(0));
    isCommittingRef.current = false;
    committedThisGestureRef.current = false;
  }, [resetKey, translateX]);

  // --- Commit Logic ---
  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (isCommittingRef.current || committedThisGestureRef.current) return;

      isCommittingRef.current = true;
      committedThisGestureRef.current = true;

      const toX = direction === "left" ? -width * 1.2 : width * 1.2;

      Animated.timing(translateX, {
        toValue: toX,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onSwipeCommit?.(direction);
        translateX.setValue(0);
        isCommittingRef.current = false;
      });
    },
    [width, translateX, onSwipeCommit],
  );

  // ✅ PAN RESPONDER (Ré-implémenté correctement)
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderGrant: () => {
        committedThisGestureRef.current = false;
      },
      onPanResponderMove: (_, g) => {
        if (isCommittingRef.current || committedThisGestureRef.current) return;

        const direction: SwipeDirection = g.dx < 0 ? "left" : "right";
        const progress = Math.min(Math.abs(g.dx) / (commitPx || 1), 1);

        onSwipeProgress?.({ dx: g.dx, progress, direction });

        // Seuil atteint -> On commit
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
          friction: 6,
          useNativeDriver: true,
        }).start(() => onSwipeCancel?.());
      },
    });
  }, [commitPx, commitSwipe, onSwipeCancel, onSwipeProgress, translateX]);

  // --- Animations Overlays ---
  const approveOpacity = translateX.interpolate({
    inputRange: [0, commitPx],
    outputRange: [0, overlayMaxOpacity],
    extrapolate: "clamp",
  });

  const trashOpacity = translateX.interpolate({
    inputRange: [-commitPx, 0],
    outputRange: [overlayMaxOpacity, 0],
    extrapolate: "clamp",
  });

  const backScale = translateX.interpolate({
    inputRange: [-commitPx, 0, commitPx],
    outputRange: [1, backCardDepthEffect ? 0.985 : 1, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.deck}>
        {/* BACK CARD */}
        {backItem !== undefined && (
          <Animated.View style={[styles.layer, { transform: [{ scale: backScale }] }]}>
            <Card
              stylesOverride={styles.card} // ✅ Reçoit l'objet CardStyles
              renderOverlay={() => (
                <>
                  {leftAction && (
                    <Animated.View
                      style={[
                        styles.overlayCommon,
                        styles.overlayLeft,
                        { width: leftOverlayWidthPx, opacity: approveOpacity },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.fillLeft,
                          {
                            width: leftOverlayWidthPx,
                            backgroundColor: leftAction.color,
                            transform: [
                              {
                                translateX: translateX.interpolate({
                                  inputRange: [0, commitPx],
                                  outputRange: [-leftOverlayWidthPx, 0],
                                  extrapolate: "clamp",
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Icon
                        {...leftAction.icon}
                        size={leftAction.iconSize ?? 26}
                        color={leftAction.iconColor ?? theme.colors.background}
                      />
                    </Animated.View>
                  )}

                  {rightAction && (
                    <Animated.View
                      style={[
                        styles.overlayCommon,
                        styles.overlayRight,
                        { width: rightOverlayWidthPx, opacity: trashOpacity },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.fillRight,
                          {
                            width: rightOverlayWidthPx,
                            backgroundColor: rightAction.color,
                            transform: [
                              {
                                translateX: translateX.interpolate({
                                  inputRange: [-commitPx, 0],
                                  outputRange: [0, rightOverlayWidthPx],
                                  extrapolate: "clamp",
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Icon
                        {...rightAction.icon}
                        size={rightAction.iconSize ?? 26}
                        color={rightAction.iconColor ?? theme.colors.background}
                      />
                    </Animated.View>
                  )}
                </>
              )}
            >
              {renderBack ? renderBack(backItem) : null}
            </Card>
          </Animated.View>
        )}

        {/* FRONT CARD */}
        <Animated.View
          testID="deck-front-card"
          style={[styles.layer, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers} // ✅ PanResponder est de retour
        >
          <Card stylesOverride={styles.card}>{renderFront(frontItem)}</Card>
        </Animated.View>
      </View>
    </View>
  );
}
