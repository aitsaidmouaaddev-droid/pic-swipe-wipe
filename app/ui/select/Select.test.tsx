/**
 * @file Select.test.tsx
 * @description Comprehensive tests for Select:
 * - Single vs multiple selection behavior
 * - Correct value propagation to parent (onSelect)
 * - Placeholder / display text formatting
 * - Modal open/close via trigger + outside tap
 * - Menu positioning (top/bottom) and width clamping to trigger width
 * - Icon rendering + color switching for selected items
 *
 * Notes:
 * - We mock ThemeContext + Icon so we can assert colors/props deterministically.
 * - We mock ref.measure() to control layout (pageX/pageY/width/height).
 */

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { render, fireEvent, waitFor, within } from "@testing-library/react-native";
import Select, { SelectOption } from "./Select";
import { UIManager } from "react-native";
import * as ReactNS from "react";

// --------------------
// Mocks
// --------------------

const mockTheme = {
  mode: "dark",
  colors: {
    background: "#0B1220",
    surface: "#111827",
    border: "#1F2937",
    text: "#F1F5F9",
    onSurface: "#F1F5F9",
    mutedText: "#94A3B8",
    primary: "#3B82F6",
    secondary: "#1E293B",
    danger: "#F87171",
    success: "#34D399",
    shadow: "rgba(0,0,0,0.6)",
    track: "#334155",
  },
};

jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

/**
 * Mock Icon to make it testable.
 * We render a <View> with:
 * - testID: icon-<name>
 * - props stored as JSON string in "accessibilityLabel"
 */
jest.mock("@ui/icon/Icon", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Icon = (props: any) => {
    const name = props?.name ?? "unknown";
    return <View testID={`icon-${name}`} accessibilityLabel={JSON.stringify(props)} />;
  };

  return {
    __esModule: true,
    default: Icon,
  };
});

// --------------------
// Helpers
// --------------------

const options: SelectOption[] = [
  {
    label: "All Media",
    value: "all",
    startIcon: { type: "vector", name: "layers-outline" },
    endIcon: { type: "vector", name: "star", size: 14 },
  },
  {
    label: "Photos",
    value: "image",
    startIcon: { type: "vector", name: "image-outline" },
  },
  {
    label: "Videos",
    value: "video",
    startIcon: { type: "vector", name: "videocam-outline" },
    endIcon: { type: "vector", name: "time-outline", size: 14 },
  },
];

/**
 * We need to control `triggerRef.current.measure(...)`.
 * The component calls useRef once -> we mock it to return an object whose current has measure.
 */
function mockNativeMeasureOnce({
  width,
  height,
  pageX,
  pageY,
}: {
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}) {
  // Some RN versions call UIManager.measure, others may use measureInWindow.
  const measureSpy = jest.spyOn(UIManager, "measure").mockImplementation((_node: any, cb: any) => {
    cb(0, 0, width, height, pageX, pageY);
  });

  const measureInWindowSpy = UIManager.measureInWindow
    ? jest.spyOn(UIManager, "measureInWindow").mockImplementation((_node: any, cb: any) => {
        cb(pageX, pageY, width, height);
      })
    : null;

  return { measureSpy, measureInWindowSpy };
}

function parseIconProps(iconNode: any) {
  return JSON.parse(iconNode.props.accessibilityLabel);
}

// --------------------
// Tests
// --------------------

describe("Select", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders placeholder when no value selected (single)", () => {
    // measure not used since menu won't be opened
    const onSelect = jest.fn();

    const { getByText } = render(
      <Select
        options={options}
        value={undefined}
        placeholder="Select..."
        onSelect={onSelect}
        multiple={false}
      />,
    );

    expect(getByText("Select...")).toBeTruthy();
  });

  it("renders selected label when value is set (single)", () => {
    const onSelect = jest.fn();

    const { getByText } = render(
      <Select
        options={options}
        value="video"
        placeholder="Select..."
        onSelect={onSelect}
        multiple={false}
      />,
    );

    expect(getByText("Videos")).toBeTruthy();
  });

  it("renders placeholder when value is empty array (multiple)", () => {
    const onSelect = jest.fn();

    const { getByText } = render(
      <Select
        options={options}
        value={[]}
        placeholder="Pick filters"
        onSelect={onSelect}
        multiple
      />,
    );

    expect(getByText("Pick filters")).toBeTruthy();
  });

  it("renders joined labels when multiple values selected", () => {
    const onSelect = jest.fn();

    const { getByText } = render(
      <Select
        options={options}
        value={["image", "video"]}
        placeholder="Pick filters"
        onSelect={onSelect}
        multiple
      />,
    );

    // Order comes from options filter order
    expect(getByText("Photos, Videos")).toBeTruthy();
  });

  it("opens the menu on trigger press and positions menu at bottom with correct width/left/top", async () => {
    const onSelect = jest.fn();

    // Assure-toi que ton spy déclenche le callback immédiatement
    const refSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      // x, y, width, height, pageX, pageY
      cb(0, 0, 220, 48, 12, 100);
    });

    const { getByTestId, queryByText } = render(
      <Select
        options={options}
        value={undefined}
        onSelect={onSelect}
        menuPosition="bottom"
        offset={4}
        testID="select-trigger"
      />,
    );

    // 1. Trigger le press
    fireEvent.press(getByTestId("select-trigger"));

    // 2. Attendre que le menu soit visible (le testID est la clé ici)
    let menuView;
    await waitFor(() => {
      menuView = getByTestId("select-menu");
      expect(queryByText("All Media")).toBeTruthy();
    });

    // 3. Analyse des styles (plus propre)
    // On aplatit les styles car RN peut renvoyer des arrays [style1, style2]
    const style = StyleSheet.flatten(menuView.props.style);

    expect(style.width).toBe(220); // ✅ Menu == Trigger width
    expect(style.left).toBe(12); // ✅ Alignement horizontal
    expect(style.top).toBe(100 + 48 + 4); // ✅ pageY + height + offset
    expect(style.position).toBe("absolute");

    refSpy.mockRestore();
  });

  it("positions menu at top when menuPosition='top'", async () => {
    const onSelect = jest.fn();

    // Mock de la mesure (200x50 à la position 20,300)
    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      cb(0, 0, 200, 50, 20, 300);
    });

    const { getByTestId, queryByText } = render(
      <Select
        options={options}
        value={undefined}
        placeholder="Select..."
        onSelect={onSelect}
        menuPosition="top"
        testID="select-trigger"
      />,
    );

    // 1. Action : Press
    fireEvent.press(getByTestId("select-trigger"));

    // 2. Attente asynchrone : Le menu doit apparaître
    let menuContainer;
    await waitFor(() => {
      // On utilise le testID "select-menu" qu'on a ajouté au composant
      menuContainer = getByTestId("select-menu");
      expect(queryByText("Photos")).toBeTruthy();
    });

    // 3. Validation des styles
    const menuStyle = StyleSheet.flatten(menuContainer.props.style);

    expect(menuStyle.width).toBe(200); // Largeur calquée sur le trigger
    expect(menuStyle.left).toBe(20); // Aligné sur le trigger (pageX)

    // Selon ton implémentation : layout.y (300) - 200
    expect(menuStyle.top).toBe(300 - 200);

    measureSpy.mockRestore();
  });

  it("closes menu when pressing outside overlay", async () => {
    const onSelect = jest.fn();

    // Mock de measure pour forcer l'ouverture
    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      cb(0, 0, 200, 48, 10, 100);
    });

    const { getByTestId, queryByText, findByText } = render(
      <Select options={options} value={undefined} onSelect={onSelect} testID="select-trigger" />,
    );

    // 1. Ouvrir le menu
    fireEvent.press(getByTestId("select-trigger"));

    // 2. ATTENDRE que le menu soit visible
    // findByText va attendre que la Modal passe à visible={true}
    const item = await findByText("All Media");
    expect(item).toBeTruthy();

    // 3. Cliquer sur l'overlay pour fermer
    // On utilise le nouveau testID, beaucoup plus fiable que de filtrer des Views
    fireEvent.press(getByTestId("select-overlay"));

    // 4. ATTENDRE que le menu disparaisse
    // Comme setIsOpen(false) déclenche un re-render, on utilise waitFor
    await waitFor(() => {
      expect(queryByText("All Media")).toBeFalsy();
    });

    measureSpy.mockRestore();
  });

  // 1. On ajoute 'async'
  it("single selection: pressing an option calls onSelect(value) and closes menu", async () => {
    const onSelect = jest.fn();

    // Mock de measure pour déclencher l'ouverture
    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      cb(0, 0, 200, 48, 10, 100);
    });

    const { getByTestId, queryByText, findByText, findByTestId } = render(
      <Select
        options={options}
        value={undefined}
        onSelect={onSelect}
        multiple={false}
        testID="select-trigger"
      />,
    );

    // 2. Ouvrir le menu
    fireEvent.press(getByTestId("select-trigger"));

    // 3. ATTENDRE que le menu soit visible (findByTestId attend automatiquement)
    const menu = await findByTestId("select-menu");

    // 4. Cliquer sur l'option "Photos" à l'intérieur du menu
    // On utilise 'within' pour être sûr de cliquer dans la liste
    const photosOption = within(menu).getByText("Photos");
    fireEvent.press(photosOption);

    // 5. Vérifier l'appel du callback
    expect(onSelect).toHaveBeenCalledWith("image");

    // 6. Vérifier que le menu SE FERME (puisqu'on est en single selection)
    // On utilise waitFor car la fermeture est asynchrone (setIsOpen(false))
    await waitFor(() => {
      expect(queryByText("Photos")).toBeFalsy();
    });

    measureSpy.mockRestore();
  });

  it("multiple selection: toggles values (add/remove) and menu stays open", async () => {
    const onSelect = jest.fn();

    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      cb(0, 0, 200, 48, 10, 100);
    });

    const { getByTestId, findByTestId, rerender } = render(
      <Select options={options} value={[]} onSelect={onSelect} multiple testID="select-trigger" />,
    );

    // 1. Ouvrir le menu
    fireEvent.press(getByTestId("select-trigger"));

    // 2. Attendre que le menu soit là
    const menu = await findByTestId("select-menu");

    // 3. Sélectionner "Photos" (On cherche spécifiquement DANS le menu)
    const photosItem = within(menu).getByText("Photos");
    fireEvent.press(photosItem);
    expect(onSelect).toHaveBeenCalledWith(["image"]);

    // 4. Simuler la mise à jour de la prop par le parent
    rerender(
      <Select
        options={options}
        value={["image"]}
        onSelect={onSelect}
        multiple
        testID="select-trigger"
      />,
    );

    // 5. Dé-sélectionner "Photos" (Toggle)
    // On récupère à nouveau le menu mis à jour
    const updatedMenu = getByTestId("select-menu");
    const photosItemToToggle = within(updatedMenu).getByText("Photos");

    fireEvent.press(photosItemToToggle);

    // onSelect doit être appelé avec un tableau vide
    expect(onSelect).toHaveBeenCalledWith([]);

    measureSpy.mockRestore();
  });

  it("renders trigger icon always and uses onSurface/text color", () => {
    const onSelect = jest.fn();

    const { getByTestId } = render(
      <Select
        options={options}
        value={undefined}
        onSelect={onSelect}
        triggerIcon={{ type: "vector", name: "chevron-down" }}
        testID="select-trigger"
      />,
    );

    const icon = getByTestId("icon-chevron-down");
    const props = parseIconProps(icon);

    expect(props.size).toBe(20);
    expect(props.color).toBe(mockTheme.colors.onSurface); // uses onSurface ?? text
  });

  //  Ajoute "async" ici
  it("renders start/end icons for items and applies primary color when selected", async () => {
    const onSelect = jest.fn();

    // Mock de measure pour forcer l'ouverture de la Modal
    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      // x, y, width, height, pageX, pageY
      cb(0, 0, 200, 48, 10, 100);
    });

    const { getByTestId, findByTestId } = render(
      <Select
        options={options} // Assure-toi que "all" a un startIcon et endIcon dans tes options de test
        value={"all"}
        onSelect={onSelect}
        testID="select-trigger"
      />,
    );

    // 1. Action : Ouvrir le menu
    fireEvent.press(getByTestId("select-trigger"));

    // 2. Attendre que le menu soit monté (findByTestId est asynchrone)
    const menu = await findByTestId("select-menu");
    expect(menu).toBeTruthy();

    // 3. Vérifier les icônes de l'item "All Media"
    const startIcon = getByTestId("icon-layers-outline");
    const endIcon = getByTestId("icon-star");

    expect(startIcon).toBeTruthy();
    expect(endIcon).toBeTruthy();

    /**
     * 4. Vérification des couleurs (Primary car sélectionné)
     * On parse l'accessibilityLabel car ton mock d'Icon y stocke les props en JSON
     */
    const startIconProps = JSON.parse(startIcon.props.accessibilityLabel);
    const endIconProps = JSON.parse(endIcon.props.accessibilityLabel);

    expect(startIconProps.color).toBe(mockTheme.colors.primary);
    expect(endIconProps.color).toBe(mockTheme.colors.primary);

    // 5. Vérification pour un élément non sélectionné (ex: Photos)
    const photosIcon = getByTestId("icon-image-outline");
    const photosIconProps = JSON.parse(photosIcon.props.accessibilityLabel);

    // Doit être la couleur de base (onSurface / text)
    expect(photosIconProps.color).toBe(mockTheme.colors.onSurface);

    measureSpy.mockRestore();
  });

  /**
   * ✅ On ajoute 'async' pour pouvoir utiliser 'waitFor'
   */
  it("menu width equals trigger width (prevents overlay/menu surpassing component width)", async () => {
    const onSelect = jest.fn();

    // Assure-toi que ce mock fonctionne et appelle le callback
    const measureSpy = jest.spyOn(View.prototype, "measure").mockImplementation((cb) => {
      cb(0, 0, 123, 48, 7, 50);
    });

    const { getByTestId, queryByText, debug } = render(
      <Select
        options={options} // 👈 VERIFIE BIEN LE CONTENU DE CE TABLEAU
        value={undefined}
        onSelect={onSelect}
        testID="select-trigger"
      />,
    );

    fireEvent.press(getByTestId("select-trigger"));

    await waitFor(
      () => {
        // debug(); // 👈 DECOMMENTE CA pour voir l'arbre dans ta console si ça rate
        expect(queryByText(/videos/i)).toBeTruthy(); // 👈 Utilisation de RegEx pour éviter les pièges
      },
      { timeout: 2000 },
    );

    const menuContainer = getByTestId("select-menu");
    const menuStyle = StyleSheet.flatten(menuContainer.props.style);

    expect(menuStyle.width).toBe(123);
    expect(menuStyle.left).toBe(7);

    measureSpy.mockRestore();
  });
});
