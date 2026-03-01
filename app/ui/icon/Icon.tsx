import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import makeIconStyles, { IconStyles } from "./icon.style";
import { useResultedStyle } from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";

export type IconRenderer = React.ComponentType<{
  name: any; // Utilisation de any pour accepter différents jeux d'icônes
  size?: number;
  color?: string;
}>;

export type SvgIconComponent = React.ComponentType<{
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}>;

interface IconBaseProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface VectorIconProps extends IconBaseProps {
  type: "vector";
  name: string; // Ex: "trash", "checkmark"
  as?: IconRenderer;
}

export interface SvgIconProps extends IconBaseProps {
  type: "svg";
  Svg: SvgIconComponent;
}

export type IconProps = (VectorIconProps | SvgIconProps) & {
  stylesOverride?: Partial<IconStyles>;
};

export default function Icon({ stylesOverride, ...props }: IconProps) {
  const { theme } = useTheme();
  const size = props.size ?? 20;
  // Utilise la couleur du thème par défaut si non fournie
  const color = props.color ?? theme.colors.onSurface ?? "#000";

  const styles = useResultedStyle<IconStyles>(theme, makeIconStyles, stylesOverride);

  /**
   * ✅ CRUCIAL POUR TES TESTS :
   * On génère un label de métadonnées que tes tests unitaires (parseIconProps)
   * utilisent pour vérifier la couleur et le nom de l'icône.
   */
  const accessibilityMetadata = JSON.stringify({
    type: props.type,
    name: props.type === "vector" ? props.name : "custom-svg",
    size,
    color,
  });

  if (props.type === "svg") {
    const Svg = props.Svg;
    return (
      <View
        style={[styles.container, props.style]}
        testID={props.testID}
        accessibilityLabel={accessibilityMetadata}
      >
        <Svg width={size} height={size} fill={color} stroke={color} />
      </View>
    );
  }

  // ✅ Cast propre pour le renderer vectoriel
  const Renderer = (props.as as any) ?? Ionicons;

  return (
    <View
      style={[styles.container, props.style]}
      testID={props.testID ?? `icon-${props.name}`}
      accessibilityLabel={accessibilityMetadata}
    >
      <Renderer name={props.name} size={size} color={color} />
    </View>
  );
}
