import React from "react";
import { render } from "@testing-library/react-native";
import Icon from "./Icon";

// THE ULTIMATE FIX: We don't use JSX in the mock.
// We use a plain string for the component name, which Jest/React understands as a "host component".
jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Icon-Mock-Ionicons", // Jest will render this as <Icon-Mock-Ionicons />
  };
});

describe("Icon Component", () => {
  describe("Vector Mode", () => {
    it("renders a vector icon with the correct name and size", () => {
      // We pass a testID directly to the Icon props if your Icon component forwards it,
      // otherwise, we'll find it by its mock name.
      const { getByTestId } = render(
        <Icon type="vector" name="checkmark-circle" size={30} color="green" testID="my-icon" />,
      );

      // In the mock, the "Renderer" becomes our string "Icon-Mock-Ionicons"
      // We look for the component that has the name we gave it.
      const icon = getByTestId("my-icon").children[0];

      expect(icon).toBeTruthy();
      expect(icon.props.name).toBe("checkmark-circle");
      expect(icon.props.size).toBe(30);
      expect(icon.props.color).toBe("green");
    });
  });

  describe("SVG Mode", () => {
    it("renders an SVG component with the correct dimensions", () => {
      // Mocking inside the 'it' block is safe because it's not hoisted!
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View } = require("react-native");
      const MockSvg = (props: any) => <View testID="svg-icon" {...props} />;

      const { getByTestId } = render(<Icon type="svg" Svg={MockSvg} size={50} color="blue" />);

      const svg = getByTestId("svg-icon");
      expect(svg.props.width).toBe(50);
      expect(svg.props.height).toBe(50);
    });
  });
});
