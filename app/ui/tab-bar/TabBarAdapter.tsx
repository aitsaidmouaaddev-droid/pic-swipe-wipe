import APP_CONFIG from "@config";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { ThemeTokens } from "@themes/theme";
import React from "react";
import TabBar, { TabBarProps } from "./TabBar";
import type { TabConfigItem } from "./tabs.config";

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
  const activeTab = state.routes[state.index].name;

  return (
    <TabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabPress={(tabName) => navigation.navigate(tabName)}
      showIcons={showIcons}
      showLabels={showLabels}
      iconPosition={iconPosition}
      gap={gap}
      iconSize={iconSize}
      stylesOverride={{
        container: {
          bottom: APP_CONFIG.tabs.bottom || 24,
          height: APP_CONFIG.tabs.height || 65,
        },
        label: {
          color: APP_CONFIG.tabs.inactiveTintColor,
        },
        labelActive: {
          color: APP_CONFIG.tabs.activeTintColor,
        },
      }}
    />
  );
}
