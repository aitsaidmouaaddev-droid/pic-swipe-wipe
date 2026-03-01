import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import Icon from "@ui/icon/Icon";
import { useResultedStyle } from "@hooks/useResultedStyle.hook";
import makeButtonStyles, {
  ButtonSize,
  ButtonVariant,
  ButtonIconPosition,
  getButtonTextStyleKey,
  getButtonIconColor,
  ButtonStyles,
  getButtonIconSize,
  getFlexDirection,
} from "./button.style";

export interface ButtonProps {
  label?: string;
  stylesOverride?: Partial<ButtonStyles>;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: any; // Shortcut for startIcon
  startIcon?: any;
  endIcon?: any;
  iconPosition?: ButtonIconPosition;
  gap?: number;
  testID?: string;
}

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
  stylesOverride,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();

  // ✅ Utilisation du hook pour fusionner Thème + Overrides
  const styles = useResultedStyle<ButtonStyles>(theme, makeButtonStyles, stylesOverride);

  const textKey = getButtonTextStyleKey(variant);
  const iconColor = getButtonIconColor(theme, variant);
  const iconSize = getButtonIconSize(size);

  const finalStartIcon = startIcon ?? icon;
  const finalEndIcon = endIcon;

  const hasText = Boolean(label);
  const hasAnyIcon = Boolean(finalStartIcon || finalEndIcon);

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      // On combine les styles de base, de taille et de variante
      style={({ pressed }) => [
        styles[size],
        styles[variant],
        styles.base,
        disabled && styles.disabled,
        pressed && !disabled ? { opacity: 0.8 } : null,
      ]}
    >
      <View
        style={[
          styles.content, // ✅ Remplace "local"
          {
            flexDirection: getFlexDirection(iconPosition),
            gap: hasText && hasAnyIcon ? gap : 0,
          },
        ]}
      >
        {finalStartIcon && (
          <Icon
            {...finalStartIcon}
            size={finalStartIcon.size ?? iconSize}
            color={finalStartIcon.color ?? iconColor}
            stylesOverride={styles.icon} // ✅ On passe l'override à l'atome Icon
          />
        )}

        {hasText && <Text style={[styles.textBase, styles[textKey]]}>{label}</Text>}

        {finalEndIcon && (
          <Icon
            {...finalEndIcon}
            size={finalEndIcon.size ?? iconSize}
            color={finalEndIcon.color ?? iconColor}
            stylesOverride={styles.icon}
          />
        )}
      </View>
    </Pressable>
  );
}
