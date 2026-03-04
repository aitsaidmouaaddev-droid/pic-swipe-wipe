import React from "react";
import { View, Button, Platform, StyleSheet } from "react-native";
import { ThemeProvider, useTheme } from "@themes/ThemeContext";

/**
 * Composant interne pour basculer le thème (Light/Dark).
 * Placé en haut à droite pour ne pas gêner la vue du composant.
 */
const ThemeToggle = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme, mode } = useTheme();

  return (
    // Le conteneur principal s'adapte à la couleur de fond du thème
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      {/* 📱 Le Frame Mobile (actif uniquement sur Web) */}
      <View style={styles.mobileFrame}>
        {/* Bouton flottant de switch de Thème */}
        <View style={styles.toggleContainer}>
          <Button
            title={mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            onPress={toggleTheme}
            color={Platform.OS === "ios" ? theme.colors.primary : undefined}
          />
        </View>

        {/* Rendu de la Story */}
        {children}
      </View>
    </View>
  );
};

/**
 * Configuration globale de Storybook
 */
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

/**
 * Décorateurs globaux : ils entourent chaque story.
 * L'ordre est important : ThemeProvider doit être au-dessus pour que useTheme fonctionne.
 */
export const decorators = [
  (Story: React.ComponentType) => (
    <ThemeProvider>
      <ThemeToggle>
        <Story />
      </ThemeToggle>
    </ThemeProvider>
  ),
];

/**
 * Styles pour simuler un rendu mobile sur le Web
 */
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // Sur web, on met un fond gris neutre derrière le "téléphone"
    backgroundColor: Platform.OS === "web" ? "#f0f2f5" : "transparent",
  },
  mobileFrame: {
    // 🎯 LOGIQUE WEB : On simule un écran d'iPhone
    ...(Platform.OS === "web"
      ? {
          width: 375,
          height: 812, // Format iPhone X/13/15
          maxHeight: "95vh",
          borderRadius: 30,
          overflow: "hidden",
          borderWidth: 8,
          borderColor: "#1a1a1a",
          // Ombre pour décoller le téléphone du fond gris
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }
      : {
          // 🎯 LOGIQUE NATIVE : On prend tout l'écran
          flex: 1,
          width: "100%",
        }),
  },
  toggleContainer: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 50, // On évite l'encoche sur mobile
    right: 20,
    zIndex: 9999,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
  },
});
