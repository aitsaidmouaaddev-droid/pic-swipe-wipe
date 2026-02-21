import type { IconProps } from "@ui/icon/Icon";

/**
 * Union type of all valid tab route names.
 *
 * IMPORTANT:
 * Each value must match a file name inside `app/(tabs)`.
 *
 * @example
 * app/(tabs)/HomeTab.tsx  -> "HomeTab"
 */
export type TabName =
  | "HomeTab"
  | "TrashTab"
  | "ApprovedTab";

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
  name: TabName;

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
const TABS: TabConfigItem[] = [
  {
    name: "TrashTab",
    title: "Trash",
    icon: { type: "vector", name: "trash" },
  },
  {
    name: "HomeTab",
    title: "Home",
    icon: { type: "vector", name: "home" },
  },
  {
    name: "ApprovedTab",
    title: "Approved",
    icon: { type: "vector", name: "checkmark-circle" },
  },
];

export default TABS;