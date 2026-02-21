import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import type { TabConfigItem, TabName } from "./tabs.config";
import Icon from "@ui/icon/Icon";
import { ThemeTokens } from "@themes/theme";
import makeTabBarStyles from "./tabBar.style";

/**
 * Icon position relative to label.
 */
export type TabIconPosition = "top" | "bottom" | "left" | "right";

/**
 * Props for {@link TabBar}.
 *
 * Pure UI component:
 * - no expo-router
 * - no react-navigation
 */
export interface TabBarProps {
  /** Theme tokens used to style the tab bar. */
  theme: ThemeTokens;

  /** Tabs displayed in the bar (single source of truth). */
  tabs: TabConfigItem[];

  /** Currently active tab route name. */
  activeTab: TabName;

  /** Called when user taps a tab. */
  onTabPress: (tab: TabName) => void;

  /**
   * Controls whether labels are shown.
   * @defaultValue true
   */
  showLabels?: boolean;

  /**
   * Controls whether icons are shown (when present in config).
   * @defaultValue true
   */
  showIcons?: boolean;

  /**
   * Icon position relative to label.
   * @defaultValue "top"
   */
  iconPosition?: TabIconPosition;

  /**
   * Gap between icon and label.
   * @defaultValue 6
   */
  gap?: number;

  /**
   * Icon size.
   * @defaultValue 22
   */
  iconSize?: number;
}

/**
 * Pure, design-system-ready TabBar.
 * Can be used in Expo Router, React Navigation, and Storybook.
 */
export default function TabBar({
  theme,
  tabs,
  activeTab,
  onTabPress,
  showLabels = true,
  showIcons = true,
  iconPosition = "top",
  gap = 6,
  iconSize = 22,
}: TabBarProps) {
  const styles = makeTabBarStyles(theme);

  const direction = getFlexDirection(iconPosition);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;

        const iconColor = isActive
          ? theme.colors.primary
          : theme.colors.mutedText;

        const labelColor = isActive
          ? theme.colors.primary
          : theme.colors.mutedText;

        const hasIcon = Boolean(tab.icon) && showIcons;
        const hasLabel = Boolean(tab.title) && showLabels;

        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={({ pressed }) => [
              styles.item,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <View
              style={[
                styles.itemContent,
                { flexDirection: direction, gap: hasIcon && hasLabel ? gap : 0 },
              ]}
            >
              {hasIcon && tab.icon ? (
                <Icon
                  {...tab.icon}
                  size={tab.icon.size ?? iconSize}
                  color={tab.icon.color ?? iconColor}
                />
              ) : null}

              {hasLabel ? (
                <Text style={[styles.label, { color: labelColor }]}>
                  {tab.title}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Returns a flexDirection based on icon position.
 */
function getFlexDirection(pos: TabIconPosition) {
  if (pos === "left") return "row";
  if (pos === "right") return "row-reverse";
  if (pos === "bottom") return "column-reverse";
  return "column"; // top
}

