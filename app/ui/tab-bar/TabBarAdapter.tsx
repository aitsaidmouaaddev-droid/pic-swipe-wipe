import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { TabConfigItem, TabName } from "./tabs.config";
import TabBar, { TabBarProps } from "./TabBar";
import { ThemeTokens } from "@themes/theme";

/**
 * Props for {@link TabBarAdapter}.
 * Converts React Navigation tab props into props expected by {@link TabBar}.
 */
export interface TabBarAdapterProps
  extends
    BottomTabBarProps,
    Pick<TabBarProps, "showIcons" | "showLabels" | "iconPosition" | "gap" | "iconSize"> {
  theme: ThemeTokens;
  tabs: TabConfigItem[];
}

/**
 * Adapter layer between React Navigation and the pure UI {@link TabBar}.
 */
export default function TabBarAdapter({
  state,
  navigation,
  theme,
  tabs,
  showIcons,
  showLabels,
  iconPosition,
  gap,
  iconSize,
}: TabBarAdapterProps) {
  const activeTab = state.routes[state.index].name as TabName;

  return (
    <TabBar
      theme={theme}
      tabs={tabs}
      activeTab={activeTab}
      onTabPress={(tabName) => navigation.navigate(tabName)}
      showIcons={showIcons}
      showLabels={showLabels}
      iconPosition={iconPosition}
      gap={gap}
      iconSize={iconSize}
    />
  );
}
