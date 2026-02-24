import React from "react";
import { View, Text, Image } from "react-native";
import CardsDeck from "@ui/cards-deck/CardsDeck";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { mediaScanActions } from "@store/mediaScanSlice";
import { selectFrontItem, selectBackItem } from "@store/mediaSelectors";

/**
 * HomeScreen Component
 * * The primary view for the application's "Swipe to Wipe" functionality.
 * It connects to the Redux store to display a deck of media assets (photos/videos)
 * and handles navigation through the media library via swipe gestures.
 * * @component
 * @example
 * return (
 * <HomeScreen />
 * )
 */
export default function HomeScreen() {
  const dispatch = useAppDispatch();

  /** * The media item currently being displayed on top of the stack.
   * @type {MediaItem | null} 
   */
  const frontItem = useAppSelector(selectFrontItem);

  /** * The next media item in the queue, rendered behind the front item 
   * to ensure smooth transitions during swiping.
   * @type {MediaItem | null} 
   */
  const backItem = useAppSelector(selectBackItem);

  /**
   * Internal helper to handle the conditional rendering of media types.
   * * @param {any} item - The MediaItem object to render.
   * @param {string} label - Debug label identifying if the item is "FRONT" or "BACK".
   * @returns {JSX.Element} A View containing either an Image or a Video placeholder.
   */
  const render = (item: any, label: string) => {
    if (item.type === "photo") {
      return (
        <Image
          source={{ uri: item.uri }}
          style={{ flex: 1 }}
          resizeMode="cover"
        />
      );
    }
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{label} VIDEO</Text>
        <Text>{item.name}</Text>
      </View>
    );
  };

  // Render Empty State
  if (!frontItem || !backItem) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No items yet. Run scan.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CardsDeck
        /** * The key is tied to frontItem.id to ensure the component 
         * re-mounts/resets internal animation states when the item changes.
         */
        key={frontItem.id}
        containerStyle={{ flex: 1 }}
        cardStyle={{ borderRadius: 0 }}
        frontItem={frontItem}
        backItem={backItem}
        overlayMaxOpacity={0.4}
        renderFront={(item) => render(item, "FRONT")}
        renderBack={(item) => render(item, "BACK")}
        leftAction={{
          color: "#34c759", // Green for 'Keep'
          icon: { type: "vector", name: "checkmark-circle" },
          widthRatio: 0.3,
        }}
        rightAction={{
          color: "#ff3b30", // Red for 'Delete'
          icon: { type: "vector", name: "trash" },
          widthRatio: 0.3,
        }}
        /**
         * Triggered when a swipe animation successfully completes.
         * Dispatches the 'next' action to increment the cursor in Redux.
         */
        onSwipeCommit={() => dispatch(mediaScanActions.next())}
      />
    </View>
  );
}