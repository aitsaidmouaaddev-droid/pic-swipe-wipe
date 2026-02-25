import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import Icon, { IconProps } from "@ui/icon/Icon";
import makeButtonStyles, {
  ButtonSize,
  ButtonVariant,
  ButtonIconPosition,
  getButtonTextStyleKey,
  getButtonIconColor,
  getButtonIconSize,
  getFlexDirection,
} from "./button.style";

/**
 * Props for {@link Button}.
 */
export interface ButtonProps {
  /**
   * Optional label text.
   * If omitted and an icon is provided, the button becomes "icon-only".
   */
  label?: string;

  /**
   * Called when the user presses the button.
   */
  onPress: () => void;

  /**
   * Visual style of the button.
   * @defaultValue "primary"
   */
  variant?: ButtonVariant;

  /**
   * Size preset.
   * @defaultValue "md"
   */
  size?: ButtonSize;

  /**
   * Disable interactions.
   * @defaultValue false
   */
  disabled?: boolean;

  /**
   * Single icon (useful for icon-only buttons).
   * If you need two icons, use `startIcon` and/or `endIcon`.
   */
  icon?: IconProps;

  /**
   * Icon placed before the label (or top, depending on position).
   */
  startIcon?: IconProps;

  /**
   * Icon placed after the label (or bottom, depending on position).
   */
  endIcon?: IconProps;

  /**
   * Icon position relative to label.
   * @defaultValue "left"
   */
  iconPosition?: ButtonIconPosition;

  /**
   * Space between icon and text.
   * @defaultValue 8
   */
  gap?: number;

  /**
   * Optional style overrides for container.
   */
  style?: ViewStyle;

  /**
   * Optional style overrides for text.
   */
  textStyle?: TextStyle;

  /**
   * Optional test id.
   */
  testID?: string;
}

/**
 * Atomic Button built on top of {@link Pressable}.
 *
 * Supports:
 * - text only
 * - icon only
 * - icon + text (left/right/top/bottom)
 * - start/end icons
 */
export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  icon,
  startIcon,
  endIcon,
  iconPosition = "left",
  gap = 8,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = makeButtonStyles(theme);

  const textKey = getButtonTextStyleKey(variant);
  const iconColor = getButtonIconColor(theme, variant);
  const iconSize = getButtonIconSize(size);

  // Determine what icons to render.
  // `icon` is a convenience for icon-only or single-icon cases.
  const finalStartIcon = startIcon ?? icon;
  const finalEndIcon = endIcon;

  const hasText = Boolean(label);
  const hasAnyIcon = Boolean(finalStartIcon || finalEndIcon);

  const contentDirection = getFlexDirection(iconPosition);

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      <View
        style={[
          local.content,
          { flexDirection: contentDirection, gap: hasText && hasAnyIcon ? gap : 0 },
        ]}
      >
        {finalStartIcon ? (
          <Icon
            {...finalStartIcon}
            size={finalStartIcon.size ?? iconSize}
            color={finalStartIcon.color ?? iconColor}
          />
        ) : null}

        {hasText ? (
          <Text style={[styles.textBase, styles[textKey], textStyle]}>{label}</Text>
        ) : null}

        {finalEndIcon ? (
          <Icon
            {...finalEndIcon}
            size={finalEndIcon.size ?? iconSize}
            color={finalEndIcon.color ?? iconColor}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const local = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});
