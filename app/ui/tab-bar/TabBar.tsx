import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import Icon from "@ui/icon/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";
import makeTabBarStyles, { TabBarStyles } from "./tabBar.style";
import type { TabConfigItem } from "./tabs.config";
import TABS_DEFAULT from "./tabs.config";

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
  /** Tabs displayed in the bar (single source of truth). */
  tabs?: TabConfigItem[];

  /** Currently active tab route name. */
  activeTab: string;

  /** Called when user taps a tab. */
  onTabPress: (tab: string) => void;

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

  stylesOverride?: Partial<TabBarStyles>;
}

/**
 * Pure, design-system-ready TabBar.
 * Can be used in Expo Router, React Navigation, and Storybook.
 */
export default function TabBar({
  tabs = TABS_DEFAULT,
  activeTab,
  onTabPress,
  showLabels = true,
  showIcons = true,
  iconPosition = "top",
  gap = 6,
  iconSize = 22,
  stylesOverride,
}: TabBarProps) {
  const { theme } = useTheme();
  const styles = useResultedStyle<TabBarStyles>(theme, makeTabBarStyles, stylesOverride);
  const direction = getFlexDirection(iconPosition);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;

        const iconColor = isActive ? theme.colors.primary : theme.colors.mutedText;

        const labelColor = isActive ? theme.colors.primary : theme.colors.mutedText;

        const hasIcon = Boolean(tab.icon) && showIcons;
        const hasLabel = Boolean(tab.title) && showLabels;

        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={({ pressed }) => [styles.item, pressed ? { opacity: 0.85 } : null]}
          >
            <View
              testID={`tab-item-content-${tab.name}`}
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
                <Text style={[styles.label, { color: labelColor }]}>{tab.title}</Text>
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
