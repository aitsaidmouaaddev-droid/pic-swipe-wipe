import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeApprovedScreenStyles from "./approvedScreen.style";

/**
 * Approved screen (tab content).
 * Later: allow sending items back to Home (undo) via swipe/controls.
 */
export default function ApprovedScreen() {
  const { theme } = useTheme();
  const styles = makeApprovedScreenStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>APPROVED</Text>
      <Text style={styles.subtitle}>Approved items will be shown here.</Text>
    </View>
  );
}
