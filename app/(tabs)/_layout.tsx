import APP_CONFIG from "@config";
import { useTheme } from "@themes/ThemeContext";
import TabBarAdapter from "@ui/tab-bar/TabBarAdapter";
import { routesToTabs } from "@ui/tab-bar/tabs.config";
import { Tabs } from "expo-router";

/**
 * Root layout component for tab-based navigation.
 *
 * This component utilizes `expo-router` to generate navigation tabs dynamically based on the
 * {@link TABS} configuration. It overrides the default React Navigation tab bar by injecting
 * a custom {@link TabBarAdapter}, which connects pure UI components to the routing state.
 * * It also consumes the {@link useTheme} hook to pass the current active theme down to the tab bar.
 * By default, the UI is configured to be "Tinder-like" (displaying only icons, no text labels).
 *
 * @returns The main tab navigation hierarchy.
 */
export default function TabLayout() {
  const { theme } = useTheme();

  const tabs = routesToTabs(Object.values(APP_CONFIG?.tabs?.routes));

  console.log(tabs.map((r) => r.name));

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBarAdapter
          {...props}
          theme={theme}
          tabs={tabs}
          showIcons
          showLabels={false} // Tinder-like: icons only (change if you want)
          iconPosition="top"
        />
      )}
    >
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}
