import React from "react";
import { render } from "@testing-library/react-native";
import ProgressBar from "./ProgressBar";

jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        track: "#000000",
        fill: "#ffffff",
      },
    },
  }),
}));

describe("ProgressBar Component", () => {
  it("calculates the correct width percentage for a 50% value", () => {
    const { getByTestId } = render(<ProgressBar value={0.5} />);
    const fill = getByTestId("progress-fill");

    // Check if the style contains width: "50%"
    // Note: style can be an array in React Native, so we flatten it
    const flattenedStyle = Object.assign({}, ...fill.props.style.flat());
    expect(flattenedStyle.width).toBe("50%");
  });

  it("clamps values higher than 1 to 100%", () => {
    const { getByTestId } = render(<ProgressBar value={1.5} />);
    const fill = getByTestId("progress-fill");

    const flattenedStyle = Object.assign({}, ...fill.props.style.flat());
    expect(flattenedStyle.width).toBe("100%");
  });

  it("clamps values lower than 0 to 0%", () => {
    const { getByTestId } = render(<ProgressBar value={-0.5} />);
    const fill = getByTestId("progress-fill");

    const flattenedStyle = Object.assign({}, ...fill.props.style.flat());
    expect(flattenedStyle.width).toBe("0%");
  });

  it("renders at 100% when value is exactly 1", () => {
    const { getByTestId } = render(<ProgressBar value={1} />);
    const fill = getByTestId("progress-fill");

    const flattenedStyle = Object.assign({}, ...fill.props.style.flat());
    expect(flattenedStyle.width).toBe("100%");
  });
});
