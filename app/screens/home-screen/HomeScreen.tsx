/**
 * @file HomeScreen.tsx
 * @description Écran principal connectant le deck de cartes à Redux et à la persistance SQLite.
 * Gère la navigation dans les médias et l'enregistrement des décisions de l'utilisateur.
 */
import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, Image } from "react-native";
import CardsDeck from "@ui/cards-deck/CardsDeck";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { AppMediaType, MediaItem, mediaScanActions } from "@store/mediaScanSlice";
import { selectFrontItem, selectBackItem } from "@store/mediaSelectors";
import { useMedia } from "@hooks/useMedia.hook";
import { VideoContainer } from "@ui/video-player/VideoContainer";

export default function HomeScreen() {
  const { items, cursor } = useAppSelector((state) => state.mediaScan);
  const dispatch = useAppDispatch();
  const { handleSwipeCommit } = useMedia();

  const frontItem = useAppSelector(selectFrontItem);
  const backItem = useAppSelector(selectBackItem);

  const frontItemRef = useRef(frontItem);
  useEffect(() => {
    frontItemRef.current = frontItem;
  }, [frontItem]);

  const TAB_BAR_HEIGHT = 60;

  const renderMedia = useCallback(
    (item: MediaItem) => {
      const isActive = items[cursor]?.id === item.id;

      if (item.type === AppMediaType.PHOTO) {
        return (
          <Image key={item.id} source={{ uri: item.uri }} style={{ flex: 1 }} resizeMode="cover" />
        );
      }

      if (item.type === AppMediaType.VIDEO) {
        return (
          <VideoContainer
            key={item.id}
            uri={item.uri}
            isActive={isActive}
            tabBarHeight={TAB_BAR_HEIGHT}
          />
        );
      }

      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Format non supporté</Text>
          <Text>{item.name}</Text>
        </View>
      );
    },
    [items, cursor],
  );

  // ✅ STABLE callback (doesn't change every render)
  const onCommit = useCallback(
    async (direction: "left" | "right") => {
      const item = frontItemRef.current;
      if (!item) return;

      await handleSwipeCommit(item.id, direction);
      dispatch(mediaScanActions.next());
    },
    [handleSwipeCommit, dispatch],
  );

  if (!frontItem) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No items yet. Run scan.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CardsDeck
        // ✅ REMOVE THIS:
        key={frontItem.id}
        containerStyle={{ flex: 1 }}
        cardStyle={{ borderRadius: 0 }}
        frontItem={frontItem}
        backItem={backItem}
        overlayMaxOpacity={0.4}
        renderFront={(item) => renderMedia(item)}
        renderBack={(item) => renderMedia(item)}
        leftAction={{
          color: "#34c759",
          icon: { type: "vector", name: "checkmark-circle" },
          widthRatio: 0.3,
        }}
        rightAction={{
          color: "#ff3b30",
          icon: { type: "vector", name: "trash" },
          widthRatio: 0.3,
        }}
        onSwipeCommit={onCommit}
      />
    </View>
  );
}
