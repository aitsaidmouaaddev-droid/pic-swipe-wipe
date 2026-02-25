import React, { useMemo, useRef, useState, useCallback } from "react";
import { Animated, PanResponder, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeCardsDeckStyles from "./cardsDeck.style";
import Card from "@ui/card/Card";
import Icon, { type IconProps } from "@ui/icon/Icon";

/**
 * Direction of a swipe based on dx (delta x) sign.
 */
export type SwipeDirection = "left" | "right";

/**
 * Swipe progress info emitted during dragging.
 */
export interface SwipeProgressInfo {
  /** Current translation on X axis in pixels. Negative = left. Positive = right. */
  dx: number;
  /** Progress from `0` to `1` based on the commit threshold distance (NOT full width). */
  progress: number;
  /** Direction inferred from `dx`. */
  direction: SwipeDirection;
}

/**
 * Visual configuration for an overlay action.
 *
 * **Note on Naming:**
 * - `leftAction` appears in the LEFT revealed gap (swipe RIGHT → green approve).
 * - `rightAction` appears in the RIGHT revealed gap (swipe LEFT → red trash).
 */
export interface SwipeActionVisual {
  /** Overlay background color. */
  color: string;

  /** Icon rendered inside overlay. */
  icon: IconProps;

  /**
   * Max overlay width ratio relative to deck width.
   * Clamped by `overlayMaxWidthRatio` in {@link CardsDeckProps}.
   *
   * @defaultValue `0.3`
   */
  widthRatio?: number;

  /** Icon size override. */
  iconSize?: number;

  /** Icon color override. */
  iconColor?: string;
}

/**
 * Props for the {@link CardsDeck} component.
 *
 * This represents a UI-only controlled deck: the parent provides front/back items
 * (2 items only for optimal memory performance).
 * * @typeParam TFront - The data type of the front card item.
 * @typeParam TBack - The data type of the back card item (defaults to `TFront`).
 */
export interface CardsDeckProps<TFront, TBack = TFront> {
  /** Optional container style (positioning). */
  containerStyle?: ViewStyle;

  /**
   * Optional card style applied to BOTH cards.
   * *Tip:* You usually only pass `borderRadius` here.
   */
  cardStyle?: ViewStyle;

  /** Front item to show (current). */
  frontItem: TFront;

  /** Back item to show (next). */
  backItem?: TBack;

  /** Function that renders the front card content. */
  renderFront: (item: TFront) => React.ReactNode;

  /** Function that renders the back card content. Optional. If missing, a placeholder is rendered. */
  renderBack?: (item: TBack) => React.ReactNode;

  /** Called while swiping (useful for debug/UI sync). */
  onSwipeProgress?: (info: SwipeProgressInfo) => void;

  /**
   * Auto-commit distance ratio of deck width.
   * At this point, the card auto-swipes away (no release needed).
   *
   * @defaultValue `0.3`
   */
  swipeAutoCommitThresholdRatio?: number;

  /**
   * Maximum overlay width ratio relative to deck width.
   *
   * @defaultValue `0.3`
   */
  overlayMaxWidthRatio?: number;

  /**
   * Max overlay opacity reached at the commit threshold.
   *
   * @defaultValue `0.7`
   */
  overlayMaxOpacity?: number;

  /** Called once when a swipe auto-commits. */
  onSwipeCommit?: (direction: SwipeDirection) => void;

  /** Called if a swipe is cancelled (user releases touch before the threshold). */
  onSwipeCancel?: () => void;

  /** LEFT revealed gap overlay config (swipe RIGHT → approve). */
  leftAction?: SwipeActionVisual;

  /** RIGHT revealed gap overlay config (swipe LEFT → trash). */
  rightAction?: SwipeActionVisual;

  /**
   * Adds subtle depth (scaling) on the back card during swipe.
   * @defaultValue `true`
   */
  backCardDepthEffect?: boolean;
}

/**
 * `CardsDeck`: A 2-card stack with auto-commit at a predefined threshold.
 *
 * **Key Features:**
 * - The back card exists solely to host the revealed overlays (approve/trash colors).
 * - The front card handles the `PanResponder` and is fully draggable.
 * - By mounting strictly 2 cards at a time, this component is highly optimized
 * for handling 1000+ media items without causing memory leaks.
 *
 * @returns The swipable deck UI component.
 */
export default function CardsDeck<TFront, TBack = TFront>({
  containerStyle,
  cardStyle,
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
}: CardsDeckProps<TFront, TBack>) {
  const { theme } = useTheme();
  const styles = makeCardsDeckStyles(theme);

  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(1);

  const isCommittingRef = useRef(false);
  const committedThisGestureRef = useRef(false);
  const lastCommitAtRef = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width || 1);
  };

  // Clamp ratios
  const thresholdRatio = Math.max(0.05, Math.min(swipeAutoCommitThresholdRatio, 0.9));
  const maxOverlayRatio = Math.max(0.05, Math.min(overlayMaxWidthRatio, 0.5));

  // Commit distance in px
  const commitPx = width * thresholdRatio;

  // Overlay max widths in px (capped by maxOverlayRatio)
  const leftOverlayWidthPx =
    width * Math.min(leftAction?.widthRatio ?? maxOverlayRatio, maxOverlayRatio);

  const rightOverlayWidthPx =
    width * Math.min(rightAction?.widthRatio ?? maxOverlayRatio, maxOverlayRatio);

  // Opacity grows 0 -> overlayMaxOpacity until commitPx
  const approveOpacity = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, commitPx],
        outputRange: [0, overlayMaxOpacity],
        extrapolate: "clamp",
      }),
    [translateX, commitPx, overlayMaxOpacity],
  );

  const trashOpacity = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [-commitPx, 0],
        outputRange: [overlayMaxOpacity, 0],
        extrapolate: "clamp",
      }),
    [translateX, commitPx, overlayMaxOpacity],
  );

  const backScale = useMemo(() => {
    if (!backCardDepthEffect) return new Animated.Value(1);
    return translateX.interpolate({
      inputRange: [-commitPx, 0, commitPx],
      outputRange: [1, 0.985, 1],
      extrapolate: "clamp",
    });
  }, [backCardDepthEffect, translateX, commitPx]);

  /**
   * Executes the final animated swipe out of the screen.
   * Wrapped in useCallback to satisfy exhaustive-deps in the panResponder useMemo.
   */
  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      const now = Date.now();
      if (now - lastCommitAtRef.current < 250) return; // anti double commit (device safe)
      lastCommitAtRef.current = now;

      // Lock strict: once committing started, ignore everything until release
      if (isCommittingRef.current) return;

      isCommittingRef.current = true;
      committedThisGestureRef.current = true;

      const toX = direction === "left" ? -width * 1.2 : width * 1.2;

      Animated.timing(translateX, {
        toValue: toX,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        onSwipeCommit?.(direction);
        translateX.setValue(0);

        // unlock HERE (do not rely on Release)
        isCommittingRef.current = false;

        // keep this true until next Grant to avoid re-trigger during same touch
        // committedThisGestureRef.current stays true
      });
    },
    [width, translateX, onSwipeCommit],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderTerminationRequest: () => false,

        onPanResponderTerminate: () => {
          // Gesture was interrupted (system/scroll/etc.)
          isCommittingRef.current = false;
          committedThisGestureRef.current = false;

          Animated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        },
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 && Math.abs(g.dy) < 20,

        onPanResponderMove: (_, g) => {
          if (isCommittingRef.current || committedThisGestureRef.current) return;

          const direction: SwipeDirection = g.dx < 0 ? "left" : "right";
          const progress = Math.min(Math.abs(g.dx) / (commitPx || 1), 1);

          onSwipeProgress?.({ dx: g.dx, progress, direction });

          if (Math.abs(g.dx) >= commitPx) {
            committedThisGestureRef.current = true;
            commitSwipe(direction);
            return;
          }

          translateX.setValue(g.dx);
        },

        onPanResponderRelease: () => {
          if (committedThisGestureRef.current) return;

          Animated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start(() => onSwipeCancel?.());
        },
        onPanResponderGrant: () => {
          // new gesture starts
          committedThisGestureRef.current = false;
          // keep isCommittingRef as-is (should be false after previous release)
        },
      }),
    [commitPx, commitSwipe, onSwipeCancel, onSwipeProgress, translateX],
  );

  /**
   * Back content fallback:
   * even if renderBack is not provided, we still render a back card so overlays can be visible.
   */
  const backContent =
    backItem !== undefined ? (
      renderBack ? (
        renderBack(backItem)
      ) : (
        <View style={{ flex: 1 }} />
      )
    ) : null;

  // How much of the overlay should be revealed (0..overlayWidthPx)
  const revealLeftPx = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, commitPx],
        outputRange: [0, leftOverlayWidthPx],
        extrapolate: "clamp",
      }),
    [translateX, commitPx, leftOverlayWidthPx],
  );

  /**
   * RED fill translation:
   * - dx = 0        -> fill is fully outside to the right (+width)
   * - dx = -commitPx -> fill is fully in place (0)
   */
  const trashFillTranslateX = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [-commitPx, 0],
        outputRange: [0, rightOverlayWidthPx],
        extrapolate: "clamp",
      }),
    [translateX, commitPx, rightOverlayWidthPx],
  );

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <View style={styles.deck}>
        {/* BACK card (next) - render if backItem exists */}
        {backItem !== undefined ? (
          <Animated.View style={[styles.layer, { transform: [{ scale: backScale }] }]}>
            <Card
              // Default to flex:1 so you don't need width/height in HomeScreen
              style={[{ flex: 1, height: "100%" }, cardStyle || {}]}
              renderOverlay={() => (
                <>
                  {/* GREEN on LEFT revealed gap (swipe RIGHT) */}
                  {leftAction ? (
                    <Animated.View
                      style={[
                        styles.overlayCommon,
                        styles.revealClip,
                        {
                          left: 0,
                          width: leftOverlayWidthPx,
                          opacity: approveOpacity,
                          borderTopLeftRadius: 999,
                          borderBottomLeftRadius: 999,
                        },
                      ]}
                    >
                      {/* This inner view slides so the visible part grows with swipe */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: leftOverlayWidthPx,
                          backgroundColor: leftAction.color,
                          transform: [
                            {
                              translateX: revealLeftPx.interpolate({
                                inputRange: [0, leftOverlayWidthPx],
                                outputRange: [-leftOverlayWidthPx, 0],
                                extrapolate: "clamp",
                              }),
                            },
                          ],
                        }}
                      />

                      {/* Icon stays centered in the reveal container */}
                      <Icon
                        {...leftAction.icon}
                        size={leftAction.iconSize ?? 26}
                        color={leftAction.iconColor ?? theme.colors.background}
                      />
                    </Animated.View>
                  ) : null}

                  {/* RED on RIGHT revealed gap (swipe LEFT) */}
                  {rightAction ? (
                    <Animated.View
                      style={[
                        styles.overlayCommon,
                        styles.revealClip,
                        {
                          right: 0,
                          width: rightOverlayWidthPx,
                          opacity: trashOpacity,
                          borderTopRightRadius: 999,
                          borderBottomRightRadius: 999,
                        },
                      ]}
                    >
                      <Animated.View
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          right: 0,
                          width: rightOverlayWidthPx,
                          backgroundColor: rightAction.color,
                          transform: [{ translateX: trashFillTranslateX }],
                        }}
                      />

                      <Icon
                        {...rightAction.icon}
                        size={rightAction.iconSize ?? 26}
                        color={rightAction.iconColor ?? theme.colors.background}
                      />
                    </Animated.View>
                  ) : null}
                </>
              )}
            >
              {backContent}
            </Card>
          </Animated.View>
        ) : null}

        {/* FRONT card (current draggable) */}
        <Animated.View
          style={[styles.layer, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Card style={[{ flex: 1 }, cardStyle || {}]}>{renderFront(frontItem)}</Card>
        </Animated.View>
      </View>
    </View>
  );
}
