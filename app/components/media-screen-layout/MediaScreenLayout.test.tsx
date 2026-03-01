import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import MediaScreenLayout from "./MediaScreenLayout";

// --- 1. MOCKS DES MODULES NATIFS & SERVICES ---
// On bloque SQLite et les services qui touchent au natif pour éviter les crashs Jest
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(),
  useSQLiteContext: jest.fn(),
}));

// On mock le service avec un chemin relatif pour éviter les soucis d'alias @services
jest.mock("../../services/mediaPersistenceService", () => ({
  mediaPersistenceService: {
    saveVerdict: jest.fn(),
    getMediaList: jest.fn(),
  },
}));

// --- 2. MOCK DU STORE & LOGIQUE MÉDIA ---
const mockDispatch = jest.fn();
jest.mock("@store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

// On définit le slice manuellement pour éviter le requireActual qui chargerait la DB
jest.mock("@store/mediaScanSlice", () => ({
  AppMediaType: {
    PHOTO: "photo",
    VIDEO: "video",
  },
  mediaScanActions: {
    next: jest.fn(() => ({ type: "mediaScan/next" })),
  },
}));

// --- 3. MOCK DES COMPOSANTS UI (L'UI KIT) ---

// Mock du Thème
jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: { background: "#000", text: "#fff", primary: "#6200EE" },
      spacing: { xl: 20 },
      typography: { body: 16 },
    },
  }),
}));

// ATTENTION: VideoContainer est un export NOMMÉ, on doit le mocker comme tel
jest.mock("@ui/video-player/VideoContainer", () => ({
  VideoContainer: () => {
    const { View } = require("react-native");
    return <View testID="mock-video-player" />;
  },
}));

// Mock du Deck avec des boutons pour simuler les gestes de swipe
jest.mock("@ui/cards-deck/CardsDeck", () => {
  const { View, Button } = require("react-native");
  return (props: any) => (
    <View testID="mock-cards-deck">
      {/* On exécute le render du parent pour voir si c'est une image ou une vidéo */}
      {props.renderFront(props.frontItem)}

      {/* Boutons pour déclencher les callbacks de swipe dans le test */}
      <Button title="L" testID="btn-swipe-left" onPress={() => props.onSwipeCommit("left")} />
      <Button title="R" testID="btn-swipe-right" onPress={() => props.onSwipeCommit("right")} />
    </View>
  );
});

jest.mock("@ui/select/Select", () => {
  const { View, Button } = require("react-native");
  return (props: any) => (
    <View testID="mock-select">
      <Button title="Filter" onPress={() => props.onSelect("video")} />
    </View>
  );
});

// --- 4. DATA DE TEST ---
const mockItems = [
  { id: "1", uri: "photo.jpg", type: "photo" },
  { id: "2", uri: "video.mp4", type: "video" },
];

describe("MediaScreenLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche l'état vide quand la liste est vide", () => {
    const { getByText } = render(
      <MediaScreenLayout
        items={[]}
        cursor={0}
        activeFilter="all"
        filterOptions={[]}
        onFilterChange={jest.fn()}
        emptyTitle="Vide !"
      />,
    );
    expect(getByText("Vide !")).toBeTruthy();
  });

  it("affiche une image pour les fichiers de type PHOTO", () => {
    const { getByTestId } = render(
      <MediaScreenLayout
        items={mockItems}
        cursor={0} // La photo
        activeFilter="all"
        filterOptions={[]}
        onFilterChange={jest.fn()}
      />,
    );

    // On utilise testID car getByRole("image") est capricieux en test RN
    const img = getByTestId("media-image");
    expect(img.props.source.uri).toBe("photo.jpg");
  });

  it("affiche le VideoContainer pour les fichiers de type VIDEO", () => {
    const { getByTestId } = render(
      <MediaScreenLayout
        items={mockItems}
        cursor={1} // La vidéo
        activeFilter="all"
        filterOptions={[]}
        onFilterChange={jest.fn()}
      />,
    );

    expect(getByTestId("mock-video-player")).toBeTruthy();
  });

  it("déclenche l'action de swipe et passe au suivant", async () => {
    const onSwipeAction = jest.fn();

    const { getByTestId } = render(
      <MediaScreenLayout
        items={mockItems}
        cursor={0}
        leftAction={{ color: "red", icon: {} as any, onAction: onSwipeAction }}
        activeFilter="all"
        filterOptions={[]}
        onFilterChange={jest.fn()}
      />,
    );

    // On simule le swipe via le bouton de notre mock
    await act(async () => {
      fireEvent.press(getByTestId("btn-swipe-left"));
    });

    // On vérifie que la logique métier a été appelée
    expect(onSwipeAction).toHaveBeenCalledWith(mockItems[0]);
    // On vérifie que Redux a reçu l'ordre de changer de carte
    expect(mockDispatch).toHaveBeenCalled();
  });
});
