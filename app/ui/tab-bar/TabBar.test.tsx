import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TabBar from "./TabBar";
import { lightTheme } from "@themes/light";

// 1. Mock du ThemeContext pour renvoyer ton lightTheme
jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({
    theme: require("@themes/light").lightTheme,
  }),
}));

// 2. Mock des icônes pour éviter les erreurs de modules natifs
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

/**
 * Mock data for the TabBar
 */
const mockTabs: any[] = [
  { name: "index", title: "Home", icon: { type: "vector", name: "home" } },
  { name: "settings", title: "Settings", icon: { type: "vector", name: "settings" } },
];

describe("TabBar Component", () => {
  const onTabPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all tabs provided in the config", () => {
    render(<TabBar tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} />);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("calls onTabPress with the correct name when a tab is tapped", () => {
    render(<TabBar tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} />);

    fireEvent.press(screen.getByText("Settings"));
    expect(onTabPressMock).toHaveBeenCalledWith("settings");
  });

  it("hides labels when showLabels is false", () => {
    render(
      <TabBar tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} showLabels={false} />,
    );

    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("applies the correct flex direction based on iconPosition", () => {
    const { getByTestId } = render(
      <TabBar tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} iconPosition="left" />,
    );

    // On récupère le conteneur d'un item via testID (assure-toi d'avoir testID="tab-item-content" dans TabBar.tsx)
    const itemContent = getByTestId("tab-item-content-index");

    expect(itemContent.props.style).toContainEqual(
      expect.objectContaining({ flexDirection: "row" }),
    );
  });

  it("highlights the active tab with the primary color", () => {
    render(<TabBar tabs={mockTabs} activeTab="settings" onTabPress={onTabPressMock} />);

    const activeLabel = screen.getByText("Settings");
    // On vérifie si la couleur primaire est appliquée (vérifie bien la structure de tes styles)
    expect(activeLabel.props.style).toContainEqual(
      expect.objectContaining({ color: lightTheme.colors.primary }),
    );

    const inactiveLabel = screen.getByText("Home");
    expect(inactiveLabel.props.style).toContainEqual(
      expect.objectContaining({ color: lightTheme.colors.mutedText }),
    );
  });
});
