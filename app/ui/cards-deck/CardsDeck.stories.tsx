import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import CardsDeck, { SwipeDirection } from "./CardsDeck";
import { useTheme } from "@themes/ThemeContext";

/**
 * Metadata for the CardsDeck.
 * We use a full-screen decorator to give the cards room to "fly out".
 */
const meta: Meta<typeof CardsDeck> = {
  title: "Components/CardsDeck",
  component: CardsDeck,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f5f5f5" }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardsDeck>;

// --- MOCK DATA ---
const MOCK_ITEMS = [
  { id: "1", title: "Mountain View", uri: "https://picsum.photos/seed/mtn/600/800" },
  { id: "2", title: "Ocean Breeze", uri: "https://picsum.photos/seed/sea/600/800" },
  { id: "3", title: "Forest Path", uri: "https://picsum.photos/seed/forest/600/800" },
];

/**
 * 1. BASIC SWIPE (Without Overlays)
 * Focuses strictly on the physics and the 2-card stack depth effect.
 */
export const BasicSwipe: Story = {
  render: () => {
    const [index, setIndex] = useState(0);
    const frontItem = MOCK_ITEMS[index % MOCK_ITEMS.length];
    const backItem = MOCK_ITEMS[(index + 1) % MOCK_ITEMS.length];

    return (
      <View style={{ height: 500 }}>
        <CardsDeck
          frontItem={frontItem}
          backItem={backItem}
          renderFront={(item) => <CardContent item={item} />}
          renderBack={(item) => <CardContent item={item} />}
          onSwipeCommit={() => setIndex((prev) => prev + 1)}
          backCardDepthEffect={true}
        />
      </View>
    );
  },
};

/**
 * 2. WITH ACTION OVERLAYS
 * Demonstrates the revealed "Approve" (Green) and "Trash" (Red) layers.
 */
export const WithActionOverlays: Story = {
  render: () => {
    const { theme } = useTheme();
    const [index, setIndex] = useState(0);

    const handleCommit = (dir: SwipeDirection) => {
      console.log(`Committed to: ${dir}`);
      setIndex((prev) => prev + 1);
    };

    return (
      <View style={{ height: 500 }}>
        <CardsDeck
          frontItem={MOCK_ITEMS[index % MOCK_ITEMS.length]}
          backItem={MOCK_ITEMS[(index + 1) % MOCK_ITEMS.length]}
          renderFront={(item) => <CardContent item={item} />}
          renderBack={(item) => <CardContent item={item} />}
          onSwipeCommit={handleCommit}
          // 🎯 Configure the visual feedback
          leftAction={{
            color: "#4CAF50", // Green
            icon: { type: "vector", name: "checkmark-circle" },
            widthRatio: 0.4,
          }}
          rightAction={{
            color: "#F44336", // Red
            icon: { type: "vector", name: "trash" },
            widthRatio: 0.4,
          }}
        />
        <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
          Swipe Right to Approve • Swipe Left to Delete
        </Text>
      </View>
    );
  },
};

// --- HELPER COMPONENT ---
const CardContent = ({ item }: { item: (typeof MOCK_ITEMS)[0] }) => (
  <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" }}>
    <Image source={{ uri: item.uri }} style={{ flex: 1 }} />
    <View
      style={{
        padding: 15,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
    </View>
  </View>
);
