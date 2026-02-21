import React from "react";
import { View, Text } from "react-native";
import makeHomeScreenStyles from "./homeScreen.style";
import { useTheme } from "@themes/ThemeContext";

/**
 * Home screen (tab content).
 * Later: Tinder-style swipe deck will be implemented here.
 */
export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = makeHomeScreenStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HOME</Text>
      <Text style={styles.subtitle}>Swipe deck will go here.</Text>
    </View>
  );
}