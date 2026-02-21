import { Tabs } from "expo-router";
import { useTheme } from "@themes/ThemeContext";
import TABS from "@ui/tab-bar/tabs.config";
import TabBarAdapter from "@ui/tab-bar/TabBarAdapter";

/**
 * Tabs layout.
 *
 * - Declares tab routes from TABS config
 * - Uses TabBarAdapter to connect React Navigation -> pure UI TabBar
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
          showLabels={false}   // Tinder-like: icons only (change if you want)
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