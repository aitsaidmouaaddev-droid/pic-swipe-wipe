import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Vector icon renderer (Ionicons by default).
 */
export type IconRenderer = React.ComponentType<{
  name: string;
  size?: number;
  color?: string;
}>;

/**
 * SVG icon component type (from react-native-svg transformer).
 * Most transformed SVGs accept width/height + (sometimes) fill/stroke.
 */
export type SvgIconComponent = React.ComponentType<{
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}>;

/**
 * Base props shared by all icon modes.
 */
interface IconBaseProps {
  /** Size in pixels. @defaultValue 20 */
  size?: number;

  /** Color for icon (used for vector + svg fill/stroke). */
  color?: string;

  /** Optional wrapper style. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Vector icon mode (Ionicons / Expo Vector Icons).
 */
export interface VectorIconProps extends IconBaseProps {
  type: "vector";
  name: string;
  as?: IconRenderer; // override renderer if you want another pack
}

/**
 * SVG icon mode.
 */
export interface SvgIconProps extends IconBaseProps {
  type: "svg";
  Svg: SvgIconComponent;
}

/**
 * Props for {@link Icon}.
 */
export type IconProps = VectorIconProps | SvgIconProps;

/**
 * Atomic Icon component that acts as a unified interface for both Vector and SVG icons.
 *
 * This component abstracts away the differences between `@expo/vector-icons` and
 * `react-native-svg` components, providing a consistent API for size, color, and styling.
 *
 * **Key Features:**
 * - **Vector Mode**: Renders standard icon sets (defaulting to {@link Ionicons}).
 * - **SVG Mode**: Renders custom SVG components with automatic `fill` and `stroke` mapping.
 * - **Theming**: Easily controlled via `size` and `color` props.
 *
 * @returns A wrapped icon component ready for UI use.
 */
export default function Icon(props: IconProps & { testID?: string }) {
  const size = props.size ?? 20;
  const color = props.color ?? "#000";

  if (props.type === "svg") {
    const Svg = props.Svg;
    return (
      <View style={props.style} testID={props.testID}>
        <Svg width={size} height={size} fill={color} stroke={color} />
      </View>
    );
  }

  const Renderer = props.as ?? (Ionicons as unknown as IconRenderer);
  return (
    <View style={props.style} testID={props.testID}>
      <Renderer name={props.name} size={size} color={color} />
    </View>
  );
}
