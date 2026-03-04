import React from "react";
import { View, Alert } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    onPress: { action: "pressed" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    label: "Primary Button",
    variant: "primary",
    onPress: () => Alert.alert("Button Pressed"),
  },
};

export const WithIcons: Story = {
  args: {
    label: "Start & End Icons",
    startIcon: { type: "vector", name: "add-circle-outline" },
    endIcon: { type: "vector", name: "arrow-forward" },
    variant: "secondary",
    onPress: () => {},
  },
};

export const IconOnly: Story = {
  args: {
    icon: { type: "vector", name: "heart", size: 30 },
    variant: "danger",
    size: "lg",
    onPress: () => {},
  },
};

export const Sizes: Story = {
  render: function Render(args) {
    return (
      <View style={{ gap: 10, alignItems: "center" }}>
        <Button {...args} size="sm" label="Small" />
        <Button {...args} size="md" label="Medium" />
        <Button {...args} size="lg" label="Large" />
      </View>
    );
  },
};
