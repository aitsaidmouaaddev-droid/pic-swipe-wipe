import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle } from "react-native-svg"; // 🎯 Needed for the mock SVG
import type { Meta, StoryObj } from "@storybook/react";
import Icon, { SvgIconComponent } from "./Icon";
import { useTheme } from "@themes/ThemeContext";

/**
 * A mock SVG component that represents a "User" icon.
 * This matches your SvgIconComponent interface.
 */
const MockUserSvg: SvgIconComponent = ({ width, height, fill }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24">
    <Circle cx="12" cy="8" r="4" fill={fill} />
    <Path d="M20 19v1H4v-1a7 7 0 0116 0z" fill={fill} />
  </Svg>
);

/**
 * Metadata for the Icon component.
 * We use an inline decorator to space out multiple icons in the "AllIcons" story.
 */
const meta: Meta<typeof Icon> = {
  title: "Atomic/Icon",
  component: Icon,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Icon>;

/**
 * Basic Vector icon using the default Ionicons renderer.
 */
export const Vector: Story = {
  args: {
    type: "vector",
    name: "heart",
    size: 40,
    color: "#FF0000",
  },
};

/**
 * Demonstrates the Icon component's responsiveness to the global theme.
 * The icon color will flip based on the Storybook theme toggle we built.
 */
export const ThemeAware: Story = {
  render: (args) => {
    const { theme } = useTheme();

    // 🔍 Debug: Un-comment this to see if the theme is actually updating
    // console.log("Current Theme Text Color:", theme.text);

    return (
      <View style={{ alignItems: "center" }}>
        <Icon
          {...args}
          // 🎯 Ensure theme color comes AFTER args to overwrite them
          color={theme.text || theme.colors?.text || "#000"}
        />
        <Text style={{ color: theme.text || theme.colors?.text, marginTop: 10 }}>
          I change color with the theme!
        </Text>
      </View>
    );
  },
  args: {
    type: "vector",
    name: "color-palette",
    size: 50,
    // Remove the hardcoded color from args if it exists
  },
};

/**
 * Comparison story to ensure Vector and (mocked) SVG alignment.
 * Useful for checking if sizes and paddings match across different renderers.
 */
/**
 * Comparison story using a real SVG component.
 * This validates that the Icon component correctly passes size and color
 * down to the react-native-svg elements.
 */
export const TypeComparison: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 40, alignItems: "center" }}>
      {/* Vector Side */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ marginBottom: 10, fontSize: 12, color: "#666" }}>Ionicons</Text>
        <Icon type="vector" name="person" size={50} color="#4A90E2" />
      </View>

      {/* Real SVG Side */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ marginBottom: 10, fontSize: 12, color: "#666" }}>Custom SVG</Text>
        <Icon type="svg" Svg={MockUserSvg} size={50} color="#4A90E2" />
      </View>
    </View>
  ),
};
