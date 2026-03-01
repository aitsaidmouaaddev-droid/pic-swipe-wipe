import React from "react";
import { View, Text } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import MediaScreenLayout from "./MediaScreenLayout";
import { AppMediaType } from "@store/mediaScanSlice";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";

// --- MOCK REDUX STORE ---
// On crée un store minimal pour éviter que useAppDispatch ne plante dans Storybook
const mockSlice = createSlice({
  name: "mediaScan",
  initialState: {},
  reducers: { next: () => {} },
});

const mockStore = configureStore({
  reducer: { mediaScan: mockSlice.reducer },
});

// --- DATA DE TEST ---
const MOCK_ITEMS = [
  { id: "1", uri: "https://picsum.photos/800/1200", type: AppMediaType.PHOTO },
  {
    id: "2",
    uri: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    type: AppMediaType.VIDEO,
  },
  { id: "3", uri: "https://picsum.photos/801/1201", type: AppMediaType.PHOTO },
  { id: "4", uri: "invalid-uri", type: "UNKNOWN" as any },
];

const meta: Meta<typeof MediaScreenLayout> = {
  title: "Components/MediaScreenLayout",
  component: MediaScreenLayout,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Story />
        </View>
      </Provider>
    ),
  ],
  argTypes: {
    cursor: {
      control: { type: "number", min: 0, max: MOCK_ITEMS.length - 1 },
      description: "Index de l'élément affiché au premier plan",
    },
    activeFilter: {
      control: "select",
      options: ["all", "photo", "video"],
      description: "Filtre sélectionné dans le Select",
    },
    tabBarHeight: {
      control: { type: "range", min: 0, max: 150 },
      description: "Hauteur de la TabBar pour décaler la barre de progression vidéo",
    },
    emptyTitle: {
      control: "text",
      description: "Message affiché quand items est vide ou le curseur hors limite",
    },
    // Contrôles pour les couleurs des actions de swipe
    "leftAction.color": { control: "color" },
    "rightAction.color": { control: "color" },
  },
  args: {
    items: MOCK_ITEMS,
    cursor: 0,
    activeFilter: "all",
    filterOptions: [
      { label: "Tous les médias", value: "all" },
      { label: "Photos uniquement", value: "photo" },
      { label: "Vidéos uniquement", value: "video" },
    ],
    tabBarHeight: 60,
    emptyTitle: "Plus aucun média à traiter !",
    leftAction: {
      color: "#EF4444", // Red 500
      icon: { type: "vector", name: "trash-outline", size: 32, color: "#FFF" },
      onAction: (item) => console.log("Delete:", item.id),
      widthRatio: 0.35,
    },
    rightAction: {
      color: "#22C55E", // Green 500
      icon: { type: "vector", name: "heart-outline", size: 32, color: "#FFF" },
      onAction: (item) => console.log("Keep:", item.id),
      widthRatio: 0.35,
    },
  },
};

export default meta;
type Story = StoryObj<typeof MediaScreenLayout>;

// --- VARIANTES ---

export const Default: Story = {};

/**
 * Cas où l'on veut afficher des éléments supplémentaires dans le header (ex: un compteur)
 */
export const WithHeaderExtra: Story = {
  args: {
    renderHeaderExtra: () => (
      <View style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>3 / 42</Text>
      </View>
    ),
  },
};

/**
 * Simulation de l'état vide
 */
export const EmptyState: Story = {
  args: {
    items: [],
    emptyTitle: "Félicitations, votre galerie est propre ! ✨",
  },
};

/**
 * Focus sur une vidéo pour tester les offsets de la ProgressBar
 */
export const VideoFocus: Story = {
  args: {
    cursor: 1,
    tabBarHeight: 100, // On simule une TabBar très haute
  },
};
