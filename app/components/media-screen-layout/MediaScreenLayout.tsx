import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { View, Text, Image } from "react-native";
import CardsDeck from "@ui/cards-deck/CardsDeck";
import { AppMediaType, MediaItem, mediaScanActions } from "@store/mediaScanSlice";
import { VideoContainer } from "@ui/video-player/VideoContainer";
import Select, { SelectOption } from "@ui/select/Select";
import { useTheme } from "@themes/ThemeContext";
import { useAppDispatch } from "@store/hooks";
import { IconProps } from "@ui/icon/Icon";
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
  activeFilter: string;
  onFilterChange: (val: string) => void;
  filterOptions: SelectOption[];
  renderHeaderExtra?: () => React.ReactNode;
  emptyTitle?: string;
  tabBarHeight?: number;
}

export default function MediaScreenLayout({
  items,
  cursor,
  leftAction,
  rightAction,
  activeFilter,
  onFilterChange,
  filterOptions,
  renderHeaderExtra,
  emptyTitle = "No more items",
  tabBarHeight = 60,
}: MediaScreenLayoutProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => makeMediaScreenStyles(theme), [theme]);

  const frontItem = items[cursor];
  const backItem = items[cursor + 1];

  // ✅ Gestion de la stabilité du swipe centralisée
  const frontItemRef = useRef(frontItem);
  useEffect(() => {
    frontItemRef.current = frontItem;
  }, [frontItem]);

  // Rendu interne du média
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
        return <VideoContainer uri={item.uri} isActive={isActive} tabBarHeight={tabBarHeight} />;
      }

      return (
        <View style={styles.unsupported}>
          <Text style={styles.unsupportedText}>Format non supporté</Text>
        </View>
      );
    },
    [frontItem?.id, styles, tabBarHeight],
  );

  // ✅ Callback de commit générique
  const onCommit = useCallback(
    async (direction: "left" | "right") => {
      const item = frontItemRef.current;
      if (!item) return;

      const config = direction === "left" ? leftAction : rightAction;

      if (config) {
        await config.onAction(item);
        dispatch(mediaScanActions.next());
      }
    },
    [leftAction, rightAction, dispatch],
  );

  if (!frontItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyTitle}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Le Deck (Moteur principal) */}
      <CardsDeck
        key={frontItem.id}
        stylesOverride={styles.deckContainer}
        frontItem={frontItem}
        backItem={backItem}
        renderFront={renderMedia}
        renderBack={renderMedia}
        // Configuration dynamique des actions
        leftAction={
          leftAction
            ? {
                color: leftAction.color,
                icon: leftAction.icon,
                widthRatio: leftAction.widthRatio ?? 0.3,
              }
            : undefined
        }
        rightAction={
          rightAction
            ? {
                color: rightAction.color,
                icon: rightAction.icon,
                widthRatio: rightAction.widthRatio ?? 0.3,
              }
            : undefined
        }
        onSwipeCommit={onCommit}
      />

      {/* 2. L'Overlay (Filtre + Extra) */}
      <View style={styles.headerOverlay}>
        {renderHeaderExtra?.()}
        <View style={styles.selectWrapper}>
          <Select
            options={filterOptions}
            value={activeFilter}
            onSelect={onFilterChange}
            triggerIcon={{ type: "vector", name: "filter-outline" }}
          />
        </View>
      </View>
    </View>
  );
}
