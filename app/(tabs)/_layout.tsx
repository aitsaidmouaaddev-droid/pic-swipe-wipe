import { Tabs } from "expo-router";
import { useTheme } from "@themes/ThemeContext";
import TABS from "@ui/tab-bar/tabs.config";
import TabBarAdapter from "@ui/tab-bar/TabBarAdapter";

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

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBarAdapter
          {...props}
          theme={theme}
          tabs={TABS}
          showIcons
          showLabels={false} // Tinder-like: icons only (change if you want)
          iconPosition="top"
        />
      )}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}
