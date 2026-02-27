import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Animated, PanResponder, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeCardsDeckStyles from "./cardsDeck.style";
import Card from "@ui/card/Card";
import Icon, { type IconProps } from "@ui/icon/Icon";

/**
 * =========================
 * DEBUG HELPERS
 * =========================
 */
const DEBUG = false; // <-- set false to silence logs

const log = (...args: any[]) => {
  if (!DEBUG) return;

  console.log("[CardsDeck]", ...args);
};

// throttle spammy logs (moves)
const makeThrottle = (ms: number) => {
  let last = 0;
  return (fn: () => void) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
    }
  };
};
const throttle100 = makeThrottle(100);

const itemKey = (item: any) => item?.id ?? item?.uri ?? item?.name ?? item?.key ?? "unknown";

/**
 * Direction of a swipe based on dx (delta x) sign.
 */
export type SwipeDirection = "left" | "right";

/**
 * Swipe progress info emitted during dragging.
 */
export interface SwipeProgressInfo {
  dx: number;
  progress: number;
  direction: SwipeDirection;
}

export interface SwipeActionVisual {
  color: string;
  icon: IconProps;
  widthRatio?: number;
  iconSize?: number;
  iconColor?: string;
}

export interface CardsDeckProps<TFront, TBack = TFront> {
  containerStyle?: ViewStyle;

  // kept (even if unused) to match your current props shape
  commitDelayMs?: number;

  // used for reset
  resetKey?: any;

  cardStyle?: ViewStyle;

  frontItem: TFront;
  backItem?: TBack;

  renderFront: (item: TFront) => React.ReactNode;
  renderBack?: (item: TBack) => React.ReactNode;

  onSwipeProgress?: (info: SwipeProgressInfo) => void;

  swipeAutoCommitThresholdRatio?: number;
  overlayMaxWidthRatio?: number;
  overlayMaxOpacity?: number;

  onSwipeCommit?: (direction: SwipeDirection) => void;
  onSwipeCancel?: () => void;

  leftAction?: SwipeActionVisual;
  rightAction?: SwipeActionVisual;

  backCardDepthEffect?: boolean;
}

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
  resetKey,
}: CardsDeckProps<TFront, TBack>) {
  const { theme } = useTheme();
  const styles = makeCardsDeckStyles(theme);

  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(1);

  const isCommittingRef = useRef(false);
  const committedThisGestureRef = useRef(false);
  const lastCommitAtRef = useRef(0);

  // Debug: log when front/back changes
  useEffect(() => {
    log(
      "RENDER/ITEMS",
      "front=",
      itemKey(frontItem),
      "back=",
      backItem !== undefined ? itemKey(backItem) : "none",
      "resetKey=",
      resetKey,
    );
  }, [frontItem, backItem, resetKey]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width || 1;
    setWidth(w);
    log("onLayout width =", w);
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

  // Debug: log computed layout numbers when width changes
  useEffect(() => {
    log("METRICS", {
      width,
      thresholdRatio,
      commitPx,
      leftOverlayWidthPx,
      rightOverlayWidthPx,
    });
  }, [width, thresholdRatio, commitPx, leftOverlayWidthPx, rightOverlayWidthPx]);

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
   * RESET behavior (instead of remounting with key)
   */
  useEffect(() => {
    log("RESET EFFECT fired", {
      resetKey,
      isCommitting: isCommittingRef.current,
      committed: committedThisGestureRef.current,
    });

    translateX.stopAnimation(() => {
      translateX.setValue(0);
    });

    isCommittingRef.current = false;
    committedThisGestureRef.current = false;
    lastCommitAtRef.current = 0;
  }, [resetKey, translateX]);

  /**
   * Commit swipe (animate out + notify parent)
   */
  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      log("commitSwipe CALLED", {
        direction,
        isCommitting: isCommittingRef.current,
        committed: committedThisGestureRef.current,
        width,
        commitPx,
      });

      if (isCommittingRef.current) {
        log("commitSwipe ABORT: already committing");
        return;
      }
      if (committedThisGestureRef.current) {
        log("commitSwipe ABORT: already committed this gesture");
        return;
      }

      const now = Date.now();
      if (now - lastCommitAtRef.current < 250) {
        log("commitSwipe ABORT: anti-double-commit window", now - lastCommitAtRef.current);
        return;
      }
      lastCommitAtRef.current = now;

      isCommittingRef.current = true;
      committedThisGestureRef.current = true; // ✅ IMPORTANT

      // snap to edge (optional)
      translateX.stopAnimation(() => {
        translateX.setValue(direction === "left" ? -commitPx : commitPx);
      });

      const toX = direction === "left" ? -width * 1.2 : width * 1.2;

      log("commitSwipe ANIM start", { toX });

      Animated.timing(translateX, {
        toValue: toX,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        log("commitSwipe ANIM end", { finished });

        try {
          onSwipeCommit?.(direction);
          log("onSwipeCommit fired", { direction });
        } catch (e) {
          log("onSwipeCommit threw", e);
        }

        translateX.setValue(0);

        // unlock
        isCommittingRef.current = false;
        // keep committedThisGestureRef true until next Grant
      });
    },
    [commitPx, width, translateX, onSwipeCommit],
  );

  /**
   * PanResponder
   */
  const panResponder = useMemo(() => {
    log("PanResponder CREATED (useMemo)");

    return PanResponder.create({
      onPanResponderTerminationRequest: () => {
        log("terminationRequest -> false");
        return false;
      },

      onMoveShouldSetPanResponder: (_, g) => {
        const should = Math.abs(g.dx) > 5 && Math.abs(g.dy) < 20;
        if (should) {
          throttle100(() =>
            log("onMoveShouldSetPanResponder = true", {
              dx: g.dx,
              dy: g.dy,
              isCommitting: isCommittingRef.current,
              committed: committedThisGestureRef.current,
            }),
          );
        }
        return should;
      },

      onMoveShouldSetPanResponderCapture: (_, g) => {
        const should = Math.abs(g.dx) > 5 && Math.abs(g.dy) < 20;
        if (should) {
          throttle100(() =>
            log("onMoveShouldSetPanResponderCapture = true", {
              dx: g.dx,
              dy: g.dy,
              isCommitting: isCommittingRef.current,
              committed: committedThisGestureRef.current,
            }),
          );
        }
        return should;
      },

      onPanResponderGrant: () => {
        log("GRANT", {
          isCommitting: isCommittingRef.current,
          committedBefore: committedThisGestureRef.current,
        });

        // new gesture starts
        committedThisGestureRef.current = false;
      },

      onPanResponderMove: (_, g) => {
        if (isCommittingRef.current || committedThisGestureRef.current) return;

        const direction: SwipeDirection = g.dx < 0 ? "left" : "right";
        const progress = Math.min(Math.abs(g.dx) / (commitPx || 1), 1);

        // throttled move logs
        throttle100(() => {
          log("MOVE", {
            dx: g.dx,
            dy: g.dy,
            direction,
            progress,
            commitPx,
          });
        });

        onSwipeProgress?.({ dx: g.dx, progress, direction });

        if (Math.abs(g.dx) >= commitPx) {
          log("THRESHOLD reached -> commitSwipe", {
            dx: g.dx,
            commitPx,
            direction,
          });
          commitSwipe(direction);
          return;
        }

        translateX.setValue(g.dx);
      },

      onPanResponderRelease: () => {
        log("RELEASE", {
          isCommitting: isCommittingRef.current,
          committed: committedThisGestureRef.current,
        });

        if (isCommittingRef.current || committedThisGestureRef.current) return;

        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start(({ finished }) => {
          log("CANCEL spring end", { finished });
          onSwipeCancel?.();
        });
      },

      onPanResponderTerminate: () => {
        log("TERMINATE", {
          isCommitting: isCommittingRef.current,
          committed: committedThisGestureRef.current,
        });

        isCommittingRef.current = false;
        committedThisGestureRef.current = false;

        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start(({ finished }) => log("TERMINATE spring end", { finished }));
      },
    });
  }, [commitPx, commitSwipe, onSwipeCancel, onSwipeProgress, translateX]);

  /**
   * Back content fallback
   */
  const backContent =
    backItem !== undefined ? (
      renderBack ? (
        renderBack(backItem)
      ) : (
        <View style={{ flex: 1 }} />
      )
    ) : null;

  // How much of the overlay should be revealed
  const revealLeftPx = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, commitPx],
        outputRange: [0, leftOverlayWidthPx],
        extrapolate: "clamp",
      }),
    [translateX, commitPx, leftOverlayWidthPx],
  );

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
        {/* BACK card (next) */}
        {backItem !== undefined ? (
          <Animated.View
            // back should be mostly visual; if you suspect it steals touches, uncomment:
            // pointerEvents="none"
            style={[styles.layer, { transform: [{ scale: backScale }] }]}
          >
            <Card
              style={[{ flex: 1, height: "100%" }, cardStyle || {}]}
              renderOverlay={() => (
                <>
                  {/* GREEN (left gap) */}
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

                      <Icon
                        {...leftAction.icon}
                        size={leftAction.iconSize ?? 26}
                        color={leftAction.iconColor ?? theme.colors.background}
                      />
                    </Animated.View>
                  ) : null}

                  {/* RED (right gap) */}
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

        {/* FRONT card (draggable) */}
        <Animated.View
          testID="deck-front-card"
          style={[styles.layer, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Card style={[{ flex: 1 }, cardStyle || {}]}>{renderFront(frontItem)}</Card>
        </Animated.View>
      </View>
    </View>
  );
}
