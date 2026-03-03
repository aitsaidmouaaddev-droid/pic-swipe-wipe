/**
 * @file Select.tsx
 * @description Dropdown Select MUI-style.
 * Features mandatory chevron in trigger, plus start/end icons for items.
 */
import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import Icon, { IconProps } from "@ui/icon/Icon";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import makeSelectStyles, { SelectStyles } from "./select.style";

export interface SelectOption {
  label: string;
  value: string | number;
  /** Icon shown before the text */
  startIcon?: IconProps;
  /** Icon shown after the text (overrides default checkmark if provided) */
  endIcon?: IconProps;
}

export interface SelectProps {
  options: SelectOption[];
  value: any;
  placeholder?: string;
  onSelect: (value: any) => void;
  multiple?: boolean;
  menuPosition?: "top" | "bottom";
  offset?: number;
  /** Mandatory icon for the trigger box */
  triggerIcon?: IconProps;
  testID?: string;
  stylesOverride?: Partial<SelectStyles>;
  iconsOnly?: boolean;
}

export default function Select({
  options,
  value,
  placeholder = "Select...",
  onSelect,
  multiple = false,
  menuPosition = "bottom",
  offset = 4,
  triggerIcon = { type: "vector", name: "chevron-down" },
  testID,
  stylesOverride,
  iconsOnly = false,
}: SelectProps) {
  const { theme } = useTheme();
  // ✅ On mémoïse les styles avec le thème en dépendance
  const styles = useResultedStyle<SelectStyles>(theme, makeSelectStyles, stylesOverride);
  const [isOpen, setIsOpen] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setLayout({ x: pageX, y: pageY, width, height });
      setIsOpen(true);
    });
  };

  const displayText = useMemo(() => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      return options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ");
    }
    return options.find((o) => o.value === value)?.label || placeholder;
  }, [value, options, multiple, placeholder]);

  const menuDynamicStyle = useMemo(
    (): ViewStyle => ({
      top: menuPosition === "bottom" ? layout.y + layout.height + offset : layout.y - 200,
      left: layout.x,
      width: layout.width,
      maxHeight: 300,
    }),
    [layout, menuPosition, offset],
  );

  const baseColor = theme.colors.onSurface ?? theme.colors.text;

  return (
    <View style={styles.container} ref={triggerRef} collapsable={false}>
      <Pressable
        onPress={openMenu}
        style={[styles.trigger, isOpen && styles.triggerActive]}
        testID={testID}
      >
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {displayText}
        </Text>
        <Icon {...triggerIcon} size={20} color={theme.colors.onSurface ?? theme.colors.text} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" testID="select-modal">
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.overlay} testID="select-overlay">
            <View style={[styles.menu, menuDynamicStyle]} testID="select-menu">
              <FlatList
                data={options}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => {
                  const isSelected = multiple ? value?.includes(item.value) : value === item.value;
                  return (
                    <Pressable
                      onPress={() => {
                        if (multiple) {
                          const newValue = Array.isArray(value) ? [...value] : [];
                          const idx = newValue.indexOf(item.value);
                          idx > -1 ? newValue.splice(idx, 1) : newValue.push(item.value);
                          onSelect(newValue);
                        } else {
                          onSelect(item.value);
                          setIsOpen(false);
                        }
                      }}
                      style={[styles.optionItem, isSelected && styles.optionSelected]}
                    >
                      {/* START ICON */}
                      {item.startIcon && (
                        <Icon
                          {...item.startIcon}
                          size={18}
                          color={isSelected ? theme.colors.primary : baseColor}
                        />
                      )}

                      {!iconsOnly && (
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {item.label}
                        </Text>
                      )}
                      {/* END ICON (Default to checkmark if selected) */}
                      {!iconsOnly && item.endIcon && (
                        <Icon
                          {...item.endIcon}
                          size={16}
                          color={isSelected ? theme.colors.primary : baseColor}
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
