import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import TabBar from "./TabBar";
import { useTheme } from "@themes/ThemeContext";

const meta: Meta<typeof TabBar> = {
  title: "Components/TabBar",
  component: TabBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabBar>;

const mockTabs: any[] = [
  { name: "index", title: "Swipe", icon: { type: "vector", name: "copy" } },
  { name: "history", title: "History", icon: { type: "vector", name: "time" } },
  { name: "settings", title: "Settings", icon: { type: "vector", name: "settings" } },
];

/**
 * Standard interactive TabBar.
 * We name the internal function 'Render' (Uppercase) to satisfy the Rules of Hooks.
 */
export const Interactive: Story = {
  render: function Render(args) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("index");

    return (
      <TabBar
        {...args}
        theme={theme}
        tabs={mockTabs}
        activeTab={activeTab as any}
        onTabPress={(name) => setActiveTab(name)}
      />
    );
  },
};

/**
 * Variation testing the 'left' icon position.
 */
export const HorizontalLayout: Story = {
  render: function Render(args) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("index");

    return (
      <TabBar
        {...args}
        theme={theme}
        tabs={mockTabs}
        activeTab={activeTab as any}
        iconPosition="left"
        gap={10}
        onTabPress={(name) => setActiveTab(name)}
      />
    );
  },
};

/**
 * Minimalist variation without labels.
 */
export const IconsOnly: Story = {
  render: function Render(args) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("index");
    return (
      <TabBar
        {...args}
        theme={theme}
        tabs={mockTabs}
        activeTab={activeTab as any}
        showLabels={false}
        onTabPress={(name) => setActiveTab(name)}
      />
    );
  },
};
