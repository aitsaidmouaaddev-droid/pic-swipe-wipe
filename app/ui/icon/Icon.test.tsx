import React from "react";
import { render } from "@testing-library/react-native";
import Icon from "./Icon";

// 1. Mock du thème pour éviter l'erreur "ThemeProvider"
jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: "#000",
        onSurface: "#000",
        // Ajoute ici d'autres couleurs si makeIconStyles en a besoin
      },
    },
  }),
}));

// 2. Mock consolidé des icônes (un seul bloc suffit)
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));

describe("Icon Component", () => {
  describe("Vector Mode", () => {
    it("renders a vector icon with the correct name and size", () => {
      const { getByTestId } = render(
        <Icon type="vector" name="checkmark-circle" size={30} color="green" testID="my-icon" />,
      );

      // Le Renderer est "Ionicons" (notre mock string)
      // On cherche l'élément enfant du View (container)
      const icon = getByTestId("my-icon").children[0];

      expect(icon).toBeTruthy();
      expect(icon.props.name).toBe("checkmark-circle");
      expect(icon.props.size).toBe(30);
      expect(icon.props.color).toBe("green");
    });
  });

  describe("SVG Mode", () => {
    it("renders an SVG component with the correct dimensions", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View } = require("react-native");
      const MockSvg = (props: any) => <View testID="svg-icon" {...props} />;

      const { getByTestId } = render(
        <Icon type="svg" Svg={MockSvg} size={50} color="blue" testID="my-svg-container" />,
      );

      const svg = getByTestId("svg-icon");
      expect(svg.props.width).toBe(50);
      expect(svg.props.height).toBe(50);
    });
  });
});
