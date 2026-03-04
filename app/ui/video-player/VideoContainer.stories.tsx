import type { Meta, StoryObj } from "@storybook/react";
import ThemeProvider from "@themes/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import VideoContainer from "./VideoContainer";

/**
 * Storybook pour le VideoContainer.
 * * Note : Ce composant utilise des modules natifs (expo-video).
 * Pour un rendu correct, utilisez Storybook sur un simulateur ou un appareil réel.
 */
const meta: Meta<typeof VideoContainer> = {
  title: "UI/VideoPlayer",
  component: VideoContainer,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={styles.wrapper}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    isActive: {
      control: "boolean",
      description: "Déclenche la lecture ou la pause de la vidéo",
    },
    tabBarHeight: {
      control: { type: "range", min: 0, max: 120, step: 1 },
      description: "Ajuste la position verticale des contrôles (Progression/Mute)",
    },
    uri: {
      control: "text",
      description: "Lien source de la vidéo",
    },
  },
};

export default meta;

type Story = StoryObj<typeof VideoContainer>;

/**
 * État par défaut : Vidéo active avec une hauteur de TabBar standard.
 */
export const Default: Story = {
  args: {
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isActive: true,
    tabBarHeight: 49,
  },
};

/**
 * Vidéo en pause (isActive: false).
 * Utile pour tester le rendu de l'overlay quand la vidéo ne tourne pas.
 */
export const Paused: Story = {
  args: {
    ...Default.args,
    isActive: false,
  },
};

/**
 * Test avec une TabBar très haute (ex: Tablette ou configuration spécifique).
 */
export const HighTabBar: Story = {
  args: {
    ...Default.args,
    tabBarHeight: 100,
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
    justifyContent: "center",
  },
});
