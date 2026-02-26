import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TabBar from "./TabBar";
import { lightTheme } from "@themes/light";

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
    onTabPressMock.mockClear();
  });

  it("renders all tabs provided in the config", () => {
    render(
      <TabBar theme={lightTheme} tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} />,
    );

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("calls onTabPress with the correct name when a tab is tapped", () => {
    render(
      <TabBar theme={lightTheme} tabs={mockTabs} activeTab="index" onTabPress={onTabPressMock} />,
    );

    fireEvent.press(screen.getByText("Settings"));
    expect(onTabPressMock).toHaveBeenCalledWith("settings");
  });

  it("hides labels when showLabels is false", () => {
    render(
      <TabBar
        theme={lightTheme}
        tabs={mockTabs}
        activeTab="index"
        onTabPress={onTabPressMock}
        showLabels={false}
      />,
    );

    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
  });

  /**
   * Test: Layout Logic
   * Verifies the icon position impacts the flex direction
   */
  it("applies the correct flex direction based on iconPosition", () => {
    const { toJSON } = render(
      <TabBar
        theme={lightTheme}
        tabs={mockTabs}
        activeTab="index"
        onTabPress={onTabPressMock}
        iconPosition="left"
      />,
    );

    const json = toJSON() as any;
    // Drill into the first item's itemContent View
    // Structure: Container -> Pressable -> View (itemContent)
    const itemContent = json.children[0].children[0];

    expect(itemContent.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ flexDirection: "row" })]),
    );
  });

  /**
   * Test: Active State Styling
   * Verifies that the active tab uses the primary color
   */
  it("highlights the active tab with the primary color", () => {
    render(
      <TabBar
        theme={lightTheme}
        tabs={mockTabs}
        activeTab="settings"
        onTabPress={onTabPressMock}
      />,
    );

    const activeLabel = screen.getByText("Settings");
    expect(activeLabel.props.style).toContainEqual({ color: lightTheme.colors.primary });

    const inactiveLabel = screen.getByText("Home");
    expect(inactiveLabel.props.style).toContainEqual({ color: lightTheme.colors.mutedText });
  });
});
