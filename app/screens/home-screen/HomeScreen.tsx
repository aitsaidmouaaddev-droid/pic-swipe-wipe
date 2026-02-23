import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import  CardsDeck from "@ui/cards-deck/CardsDeck";

/**
 * Home screen (tab content).
 * Later: Tinder-style swipe deck will be implemented here.
 */
export default function HomeScreen() {
  const { theme } = useTheme();
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    label: "Screen " + (i + 1),
    background: i % 2 === 0 ? "blue" : "yellow",
  }));
  const [index, setIndex] = useState(0);

  const n = items.length;

  const nextIndex = (i: number) => (i + 1) % n;

  const frontItem = items[index];
  const backItem = items[nextIndex(index)];


  return (
    <View style={{ flex: 1, borderRadius: 0 }}>
      <CardsDeck
        key={frontItem.id}
        containerStyle={{ flex: 1 }}
        cardStyle={{ borderRadius: 0 }}
        frontItem={frontItem}
        backItem={backItem}
        overlayMaxOpacity={0.4}
        renderFront={(item) => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: item.background }}>
            <Text>FRONT: {item.label}</Text>
          </View>
        )}
        renderBack={(item) => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: item.background }}>
            <Text>BACK: {item.label}</Text>
          </View>
        )}
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
        onSwipeCommit={() => setIndex((i) => nextIndex(i))}
      />
    </View>
  );
}