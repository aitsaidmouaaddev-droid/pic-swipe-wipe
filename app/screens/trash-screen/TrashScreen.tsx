import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeTrashScreenStyles from "./trashScreen.style";

/**
 * Trash screen (tab content).
 * Later: swipe left = delete permanently, swipe right = restore to Home queue.
 */
export default function TrashScreen() {
  const { theme } = useTheme();
  const styles = makeTrashScreenStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRASH</Text>
      <Text style={styles.subtitle}>Trashed items will be shown here.</Text>
    </View>
  );
}
