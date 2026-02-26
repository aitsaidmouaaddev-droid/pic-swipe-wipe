import React, { useState, useEffect } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import ProgressBar from "./ProgressBar";

/**
 * Metadata for the ProgressBar component stories.
 * * Includes a centered decorator to ensure the bar is visible
 * in the middle of the device screen during previews.
 */
const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  argTypes: {
    // 🎯 This adds a slider (0 to 1) in the Storybook "Controls" tab
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", padding: 40 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

/**
 * A static progression bar at 50% capacity.
 */
export const Basic: Story = {
  args: {
    value: 0.5,
  },
};

/**
 * A dynamic progression bar that automatically fills up.
 * Useful for testing the smoothness of the bar's internal animations.
 */
export const LiveProgression: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 1 ? 0 : prev + 0.1));
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return <ProgressBar value={progress} />;
  },
};
