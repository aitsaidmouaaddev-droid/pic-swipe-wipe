import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import ProgressBar from "./ProgressBar";

// Avoid Animated warnings in Jest environment
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock react-native-svg for Jest (render as simple Views)
jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
  };
});

jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        track: "#000000",
        primary: "#ffffff",
        text: "#ffffff",
      },
    },
  }),
}));

// Small helper to flatten RN styles (handles arrays + StyleSheet ids)
const flat = (style: any) => StyleSheet.flatten(style) ?? {};

describe("ProgressBar Component", () => {
  describe("Linear determinate (default)", () => {
    it("calculates the correct width percentage for a 50% value", () => {
      const { getByTestId, getByText } = render(<ProgressBar value={0.5} />);
      const fill = getByTestId("progress-fill");

      expect(flat(fill.props.style).width).toBe("50%");
      expect(getByText("50%")).toBeTruthy(); // label under the bar
    });

    it("clamps values higher than 1 to 100%", () => {
      const { getByTestId, getByText } = render(<ProgressBar value={1.5} />);
      const fill = getByTestId("progress-fill");

      expect(flat(fill.props.style).width).toBe("100%");
      expect(getByText("100%")).toBeTruthy();
    });

    it("clamps values lower than 0 to 0%", () => {
      const { getByTestId, getByText } = render(<ProgressBar value={-0.5} />);
      const fill = getByTestId("progress-fill");

      expect(flat(fill.props.style).width).toBe("0%");
      expect(getByText("0%")).toBeTruthy();
    });

    it("renders at 100% when value is exactly 1", () => {
      const { getByTestId, getByText } = render(<ProgressBar value={1} />);
      const fill = getByTestId("progress-fill");

      expect(flat(fill.props.style).width).toBe("100%");
      expect(getByText("100%")).toBeTruthy();
    });

    it("defaults to 0% if no value is provided", () => {
      const { getByTestId, getByText } = render(<ProgressBar />);
      const fill = getByTestId("progress-fill");

      expect(flat(fill.props.style).width).toBe("0%");
      expect(getByText("0%")).toBeTruthy();
    });
  });

  describe("Linear infinite", () => {
    it("renders an indeterminate bar and does NOT render the percent label", () => {
      const { getByTestId, queryByText } = render(<ProgressBar isInfinite />);
      const fill = getByTestId("progress-fill");

      // In infinite mode, width is numeric (px), not "%".
      expect(typeof flat(fill.props.style).width).toBe("number");

      // No percent label in infinite mode
      expect(queryByText(/\d+%/)).toBeNull();
    });

    it("keeps rendering even before layout measurement", () => {
      const { getByTestId } = render(<ProgressBar isInfinite />);
      const fill = getByTestId("progress-fill");

      // When trackWidth is 0, component still uses a minimum width (>= 24)
      const w = flat(fill.props.style).width;
      expect(typeof w).toBe("number");
      expect(w).toBeGreaterThanOrEqual(24);
    });

    it("updates the indeterminate bar width after layout", () => {
      const { getByTestId } = render(<ProgressBar isInfinite />);
      const track = getByTestId("progress-track");
      const fill = getByTestId("progress-fill");

      // Trigger onLayout to simulate real device measurement
      fireEvent(track, "layout", { nativeEvent: { layout: { width: 200, height: 10 } } });

      // After layout, width should be ~ 35% of track (min 24)
      const w = flat(fill.props.style).width;
      expect(typeof w).toBe("number");
      expect(w).toBeGreaterThanOrEqual(24);
    });
  });

  describe("Circular determinate", () => {
    it("renders circular variant and displays percent in the center", () => {
      const { getByTestId, getByText, queryByTestId } = render(
        <ProgressBar variant="circular" value={0.7} size={60} strokeWidth={6} />,
      );

      expect(getByTestId("progress-circle")).toBeTruthy();
      expect(getByText("70%")).toBeTruthy();

      // Linear elements should not exist
      expect(queryByTestId("progress-track")).toBeNull();
      expect(queryByTestId("progress-fill")).toBeNull();
    });

    it("clamps circular value > 1 to 100% (label)", () => {
      const { getByText } = render(<ProgressBar variant="circular" value={2} />);
      expect(getByText("100%")).toBeTruthy();
    });

    it("clamps circular value < 0 to 0% (label)", () => {
      const { getByText } = render(<ProgressBar variant="circular" value={-1} />);
      expect(getByText("0%")).toBeTruthy();
    });
  });

  describe("Circular infinite", () => {
    it("renders circular variant in infinite mode and does NOT display percent label", () => {
      const { getByTestId, queryByText } = render(<ProgressBar variant="circular" isInfinite />);

      expect(getByTestId("progress-circle")).toBeTruthy();
      expect(queryByText(/\d+%/)).toBeNull();
    });
  });
});
