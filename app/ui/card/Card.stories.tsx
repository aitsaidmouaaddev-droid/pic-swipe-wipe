import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import Icon from "@ui/icon/Icon";
import { useTheme } from "@themes/ThemeContext";

/**
 * Metadata for the Card component.
 * Decorated with a dark background to make the card's shadows pop.
 */
const meta: Meta<typeof Card> = {
  title: "Atomic/Card",
  component: Card,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: 20,
        }}
      >
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

/**
 * A "Rich Media" story simulating a profile or item card.
 * Includes an image, descriptive text, and interaction buttons.
 */
export const RichContent: Story = {
  render: () => {
    const { theme } = useTheme();

    return (
      <Card style={{ width: 320, height: 480 }}>
        {/* 🖼️ Image Header */}
        <Image
          source={{ uri: "https://picsum.photos/seed/cards/600/800" }}
          style={{
            width: "100%",
            height: "65%",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />

        {/* 📝 Content Body */}
        <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.colors.primary }}>
              Golden Retriever
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.mutedText, marginTop: 4 }}>
              Active • 2 years old • Friendly
            </Text>
          </View>

          {/* 🔘 Action Buttons */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
            <TouchableOpacity style={{ padding: 10, borderRadius: 50, backgroundColor: "#ffebee" }}>
              <Icon type="vector" name="close" size={28} color="#f44336" />
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 10, borderRadius: 50, backgroundColor: "#e8f5e9" }}>
              <Icon type="vector" name="heart" size={28} color="#4caf50" />
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 10, borderRadius: 50, backgroundColor: "#e3f2fd" }}>
              <Icon type="vector" name="information-circle" size={28} color="#2196f3" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  },
};

/**
 * Demonstrates the overlay layer functionality (e.g., Swipe Right indicator).
 * We use 'render' instead of 'args' for children to avoid JSON serialization cycles.
 */
export const WithOverlay: Story = {
  args: {
    // 🎯 We keep simple data here
    style: { width: 300, height: 400 },
  },
  render: (args) => (
    <Card
      {...args}
      renderOverlay={() => (
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(76, 175, 80, 0.4)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
          }}
        >
          <Icon type="vector" name="checkmark-circle" size={80} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>KEEP</Text>
        </View>
      )}
    >
      {/* 🎯 Move the children here, outside of the args object */}
      <View
        style={{ flex: 1, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" }}
      >
        <Text>Card Content</Text>
      </View>
    </Card>
  ),
};
