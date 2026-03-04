import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "./Button";
import { ThemeProvider } from "@themes/ThemeContext";

// Wrap helper for Theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));

describe("Button Component", () => {
  it("renders the label correctly", () => {
    const { getByText } = renderWithTheme(<Button label="Click Me" onPress={() => {}} />);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when clicked", () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(<Button label="Press" onPress={onPressMock} />);

    fireEvent.press(getByText("Press"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders only the icon if no label is provided", () => {
    const { queryByText, getByTestId } = renderWithTheme(
      <Button icon={{ type: "vector", name: "star" }} onPress={() => {}} testID="icon-button" />,
    );

    expect(queryByText(/[a-z]/i)).toBeNull();

    expect(getByTestId("icon-button")).toBeTruthy();
  });
});
