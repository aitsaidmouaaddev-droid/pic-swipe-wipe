import type { IconProps } from "@ui/icon/Icon";

/**
 * Describes a single tab entry.
 *
 * This object is the single source of truth for:
 * - Navigation routes (<Tabs.Screen />)
 * - Custom tab bar UI rendering
 */
export interface TabConfigItem {
  /**
   * Route name of the tab.
   */
  name: string;

  /**
   * Human-readable label displayed in the tab bar.
   */
  title: string;

  /**
   * Icon definition for the tab.
   *
   * Supports:
   * - Vector icons (Ionicons / Expo Vector Icons)
   * - SVG components (react-native-svg)
   *
   * @example Vector icon
   * { type: "vector", name: "home" }
   *
   * @example SVG icon
   * { type: "svg", Svg: HomeSvg }
   */
  icon?: IconProps;
}

/**
 * Tabs configuration.
 *
 * Add, remove, or reorder tabs only in this array.
 * The navigation layout and custom tab bar will adapt automatically.
 */
const TABS_DEFAULT: TabConfigItem[] = [
  {
    name: "HomeTab",
    title: "Home",
    icon: { type: "vector", name: "home" },
  },
];

export type RouteDef = {
  name: string;
  label: string;
  icon?: string;
};

export function routesToTabs(routes: RouteDef[]): TabConfigItem[] {
  return Object.values(routes).map((r) => ({
    name: r.name,
    title: r.label,
    icon: r.icon ? { type: "vector", name: r.icon } : undefined,
  }));
}

export default TABS_DEFAULT;
