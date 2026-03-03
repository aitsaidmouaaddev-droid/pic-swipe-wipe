import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import MediaScreenLayout from "./MediaScreenLayout";
import { View } from "react-native";

// On mock le service avec un chemin relatif pour éviter les soucis d'alias @services
jest.mock("@services/mediaService", () => ({
  AppMediaType: {
    PHOTO: "photo",
    VIDEO: "video",
  },
  mediaService: {
    saveVerdict: jest.fn(),
    getMediaList: jest.fn(),
  },
}));

// --- 2. MOCK DU STORE & LOGIQUE MÉDIA ---
const mockDispatch = jest.fn();
jest.mock("@hooks/store.hook", () => ({
  useAppDispatch: () => mockDispatch,
}));

// On définit le slice manuellement pour éviter le requireActual qui chargerait la DB
jest.mock("@store/mediaScanSlice", () => ({
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

jest.mock("@ui/video-player/VideoContainer", () => {
  const React = require("react");
  const { View } = require("react-native");

  // On retourne un objet avec une clé 'default' pour simuler l'export default
  return {
    __esModule: true,
    default: (props: any) => <View testID="mock-video-player" {...props} />,
  };
});

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
    const { getByText } = render(<MediaScreenLayout items={[]} cursor={0} emptyTitle="Vide !" />);
    expect(getByText("Vide !")).toBeTruthy();
  });

  it("affiche une image pour les fichiers de type PHOTO", () => {
    const { getByTestId } = render(
      <MediaScreenLayout
        items={mockItems}
        cursor={0} // La photo
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
      />,
    );

    expect(getByTestId("mock-video-player")).toBeTruthy();
  });

  it("déclenche l'action de swipe et appelle la callback fournie", async () => {
    const onSwipeAction = jest.fn();

    const { getByTestId } = render(
      <MediaScreenLayout
        items={mockItems}
        cursor={0}
        // On teste que le composant appelle bien la fonction passée en prop
        leftAction={{
          color: "red",
          icon: { type: "vector", name: "trash" } as any,
          onAction: onSwipeAction,
        }}
      >
        {/* On peut tester que les enfants sont bien rendus aussi */}
        <View testID="custom-ui" />
      </MediaScreenLayout>,
    );

    // Simulation du swipe via le mock de CardsDeck
    await act(async () => {
      fireEvent.press(getByTestId("btn-swipe-left"));
    });

    // ✅ On vérifie que la callback onAction a été appelée avec le bon item
    expect(onSwipeAction).toHaveBeenCalledWith(mockItems[0]);
  });
});
