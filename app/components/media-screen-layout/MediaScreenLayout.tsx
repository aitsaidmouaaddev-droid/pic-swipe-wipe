/**
 * @file MediaScreenLayout.tsx
 * @description Core layout for media swiping.
 * Renders the deck in the background and provides a transparent children container for UI.
 */
import APP_CONFIG from "@config";
import { AppMediaType, MediaItem } from "@services/mediaService";
import { useTheme } from "@themes/ThemeContext";
import CardsDeck from "@ui/cards-deck/CardsDeck";
import { IconProps } from "@ui/icon/Icon";
import VideoContainer from "@ui/video-player/VideoContainer";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import makeMediaScreenStyles from "./mediascreenlayout.style";

export interface SwipeActionConfig {
  color: string;
  icon: IconProps;
  onAction: (item: MediaItem) => Promise<void> | void;
  widthRatio?: number;
}

interface MediaScreenLayoutProps {
  items: MediaItem[];
  cursor: number;
  leftAction?: SwipeActionConfig;
  rightAction?: SwipeActionConfig;
  /** * Custom UI components (Filters, Buttons, HUD).
   * Rendered on top of the deck. Use absolute positioning or flex as needed.
   */
  children?: React.ReactNode;
  emptyTitle?: string;
}

export default function MediaScreenLayout({
  items,
  cursor,
  leftAction,
  rightAction,
  children,
  emptyTitle = "No more items",
}: MediaScreenLayoutProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeMediaScreenStyles(theme), [theme]);

  const frontItem = items[cursor];
  const backItem = items[cursor + 1];

  const frontItemRef = useRef(frontItem);
  useEffect(() => {
    frontItemRef.current = frontItem;
  }, [frontItem]);

  // 🛡️ Throw if config is broken
  if (!APP_CONFIG.deck) {
    throw new Error("[MediaScreenLayout] Missing APP_CONFIG.deck configuration.");
  }

  /**
   * Internal Media Renderer
   */
  const renderMedia = useCallback(
    (item: MediaItem) => {
      const isActive = frontItem?.id === item.id;

      if (item.type === AppMediaType.PHOTO) {
        return (
          <Image
            testID="media-image"
            source={{ uri: item.uri }}
            style={styles.mediaFull}
            resizeMode="cover"
          />
        );
      }

      if (item.type === AppMediaType.VIDEO) {
        return (
          <VideoContainer
            key={item.id}
            uri={item.uri}
            isActive={isActive}
            loop={APP_CONFIG.video.shouldLoop}
            contentFit={APP_CONFIG.video.contentFit}
          />
        );
      }

      return (
        <View style={styles.unsupported}>
          <Text style={styles.unsupportedText}>Unsupported format</Text>
        </View>
      );
    },
    [frontItem?.id, styles],
  );

  const onCommit = useCallback(
    async (direction: "left" | "right") => {
      const item = frontItemRef.current;
      if (!item) return;
      const config = direction === "left" ? leftAction : rightAction;
      if (config) await config.onAction(item);
    },
    [leftAction, rightAction],
  );

  // --- EMPTY STATE ---
  if (!frontItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyTitle}</Text>
        {/* We still render children so user can change filters even when empty */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. LAYER: THE DECK (Background) */}
      <View style={StyleSheet.absoluteFill}>
        <CardsDeck
          key={frontItem.id}
          stylesOverride={styles.deckContainer}
          frontItem={frontItem}
          backItem={backItem}
          renderFront={renderMedia}
          renderBack={renderMedia}
          leftAction={leftAction}
          rightAction={rightAction}
          onSwipeCommit={onCommit}
          overlayMaxOpacity={APP_CONFIG.deck.maxOverlayOpacity}
          overlayMaxWidthRatio={APP_CONFIG.deck.maxOverlayOpacity}
          swipeAutoCommitThresholdRatio={APP_CONFIG.deck.swipeThreshold}
          backCardScale={APP_CONFIG.deck.backCardScale}
        />
      </View>

      {/* 2. LAYER: UI CONTENT (Foreground) */}
      {/* pointerEvents="box-none" is key: UI elements respond to touch, 
          but empty areas let the touch pass through to the Deck. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}
