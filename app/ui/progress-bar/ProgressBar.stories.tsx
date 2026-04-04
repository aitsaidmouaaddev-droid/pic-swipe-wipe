import React, { useEffect, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import ProgressBar from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["linear", "circular"],
    },
    isInfinite: {
      control: { type: "boolean" },
    },
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      // Value is irrelevant when isInfinite=true (but we still show it)
    },
    size: {
      control: { type: "range", min: 24, max: 160, step: 1 },
      if: { arg: "variant", eq: "circular" } as any, // Storybook RN may ignore conditional controls; harmless
    },
    strokeWidth: {
      control: { type: "range", min: 2, max: 20, step: 1 },
      if: { arg: "variant", eq: "circular" } as any,
    },
    stylesOverride: { control: false },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

/**
 * Linear determinate at 50%.
 */
export const Linear: Story = {
  args: {
    variant: "linear",
    value: 0.5,
    isInfinite: false,
    stylesOverride: { linearWrapper: { width: "100%" } },
  },
};

/**
 * Linear indeterminate (infinite).
 */
export const LinearInfinite: Story = {
  args: {
    variant: "linear",
    isInfinite: true,
    stylesOverride: { linearWrapper: { width: "100%" } },
  },
};

/**
 * Circular determinate at 70%.
 */
export const Circular: Story = {
  args: {
    variant: "circular",
    value: 0.7,
    isInfinite: false,
    size: 72,
    strokeWidth: 6,
  },
};

/**
 * Circular indeterminate (infinite spinning).
 */
export const CircularInfinite: Story = {
  args: {
    variant: "circular",
    isInfinite: true,
    size: 72,
    strokeWidth: 6,
  },
};

/**
 * Live progression (loops 0 -> 100%) to see updates smoothly.
 * Works for both linear & circular via controls.
 */
export const LiveProgression: Story = {
  args: {
    variant: "linear",
    isInfinite: false,
    value: 0,
    size: 72,
    strokeWidth: 6,
  },
  render: (args) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.05;
          return next > 1 ? 0 : next;
        });
      }, 120);
      return () => clearInterval(interval);
    }, []);

    return (
      <ProgressBar
        {...args}
        // In live story, we force determinate mode
        isInfinite={false}
        value={progress}
        stylesOverride={{ linearWrapper: { width: "100%" } }}
      />
    );
  },
};
