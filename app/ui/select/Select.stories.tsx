/**
 * @file Select.stories.tsx
 * @description Stories for the atomic Select component.
 * Validates Single vs Multiple logic and Full vs Narrow layout.
 */
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import Select, { SelectOption } from "./Select";
import { useTheme } from "@themes/ThemeContext";

const SelectStateWrapper = (props: any) => {
  // Handles both single string/number and multiple arrays
  const [val, setVal] = useState(props.multiple ? [] : props.value);
  return (
    <View style={props.width ? { width: props.width, alignSelf: "center" } : styles.fullWidth}>
      <Select {...props} value={val} onSelect={setVal} />
    </View>
  );
};

const meta: Meta<typeof Select> = {
  title: "Atomic/Select",
  component: Select,
  decorators: [
    (Story) => (
      <ThemedScreen>
        <Story />
      </ThemedScreen>
    ),
  ],
  argTypes: {
    // Allows swapping the mandatory chevron for other icons in controls
    triggerIcon: { control: "object" },
    menuPosition: { control: "select", options: ["top", "bottom"] },
    multiple: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const richOptions: SelectOption[] = [
  {
    label: "All Media",
    value: "all",
    startIcon: { type: "vector", name: "layers-outline" },
    endIcon: { type: "vector", name: "star", size: 14 },
  },
  {
    label: "Photos",
    value: "image",
    startIcon: { type: "vector", name: "image-outline" },
  },
  {
    label: "Videos",
    value: "video",
    startIcon: { type: "vector", name: "videocam-outline" },
    endIcon: { type: "vector", name: "time-outline", size: 14 },
  },
];

/**
 * 1️⃣ SINGLE SELECTION - FULL WIDTH
 * Standard MUI behavior. Selecting an item closes the menu.
 */
export const SingleSelectionFullWidth: Story = {
  render: (args) => <SelectStateWrapper {...args} />,
  args: {
    options: richOptions,
    placeholder: "Select one type...",
    multiple: false,
    triggerIcon: { type: "vector", name: "chevron-down" },
  },
};

/**
 * 2️⃣ MULTIPLE SELECTION - NARROW WIDTH
 * Toggle behavior. Menu stays open to allow multiple picks.
 * Constrained to 180px width.
 */
export const MultipleSelectionNarrow: Story = {
  render: (args) => <SelectStateWrapper {...args} width={180} />,
  args: {
    options: richOptions,
    placeholder: "Filters",
    multiple: true,
    triggerIcon: { type: "vector", name: "filter-outline" },
  },
};

const ThemedScreen = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
});
