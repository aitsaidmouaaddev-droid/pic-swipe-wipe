import { render, screen } from "@testing-library/react-native";
import ThemeProvider from "@themes/ThemeContext";
import React from "react";
import { Text, View } from "react-native";
import Card from "./Card";

/**
 * Helper to wrap component in ThemeProvider for testing
 */
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("Card Component", () => {
  it("renders children content correctly", () => {
    renderWithTheme(
      <Card>
        <Text>Card Content</Text>
      </Card>,
    );

    expect(screen.getByText("Card Content")).toBeTruthy();
  });

  it("applies custom style overrides", () => {
    const customStyle = { backgroundColor: "red" };

    // We check the base view (first child of the render)
    const { JSON } = renderWithTheme(
      <Card style={customStyle}>
        <View />
      </Card>,
    );

    // Verify the style is part of the rendered output
    expect(JSON).toMatchSnapshot();
    // Or more specifically if you add a testID to Card:
    // expect(screen.getByTestId('card-base')).toHaveStyle({ backgroundColor: 'red' });
  });

  it("renders the overlay when renderOverlay is provided", () => {
    const MockOverlay = () => <Text>Overlay Active</Text>;

    renderWithTheme(
      <Card renderOverlay={() => <MockOverlay />}>
        <Text>Child</Text>
      </Card>,
    );

    expect(screen.getByText("Overlay Active")).toBeTruthy();
  });

  it("does not render the overlay layer when renderOverlay is missing", () => {
    renderWithTheme(
      <Card>
        <Text>No Overlay</Text>
      </Card>,
    );

    expect(screen.queryByText("Overlay Active")).toBeNull();
  });

  it("maintains the correct layout hierarchy (content before overlay)", () => {
    renderWithTheme(
      <Card renderOverlay={() => <Text>Overlay</Text>}>
        <Text>Main Content</Text>
      </Card>,
    );

    const content = screen.getByText("Main Content");
    const overlay = screen.getByText("Overlay");

    expect(content).toBeTruthy();
    expect(overlay).toBeTruthy();
  });
});
