import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import Logo from "./Logo";

/**
 * Metadata for the Logo component.
 * Centered in a dark-ish container to make the pulsing effect clear.
 */
const meta: Meta<typeof Logo> = {
  title: "UI/Logo",
  component: Logo,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fdfdfd",
        }}
      >
        <Story />
      </View>
    ),
  ],
  // 🎯 Connects the props to the Storybook Controls UI
  argTypes: {
    size: { control: { type: "range", min: 50, max: 300, step: 10 } },
    animation: {
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/**
 * The standard "Breathing" logo.
 * Uses a mock icon to demonstrate the pulse.
 */
export const Default: Story = {
  args: {
    source: { uri: "https://reactnative.dev/img/header_logo.svg" }, // Or your local require
    size: 150,
  },
};

/**
 * A faster, more intense pulse.
 * Useful for testing how the animation handles rapid prop changes.
 */
export const FastPulse: Story = {
  args: {
    source: { uri: "https://reactnative.dev/img/header_logo.svg" },
    size: 150,
    animation: {
      scaleFrom: 0.8,
      scaleTo: 1.2,
      duration: 300, // Very fast
    },
  },
};

/**
 * A slow, subtle breathing effect.
 */
export const SubtleZen: Story = {
  args: {
    source: { uri: "https://reactnative.dev/img/header_logo.svg" },
    size: 180,
    animation: {
      scaleFrom: 0.98,
      scaleTo: 1.02,
      duration: 2000, // Very slow
    },
  },
};
