import React from "react";
import { act, render } from "@testing-library/react-native";
import { Animated, StyleSheet } from "react-native";
import Logo from "./Logo";

// THE MOCK: The Logo needs useTheme(), but we don't want to load the whole app.
// So, we intercept the import and provide a fake "dummy" theme instead.
jest.mock("@themes/ThemeContext", () => ({
  useTheme: () => ({ theme: {} }), // makeLogoStyles only uses 'size', so an empty theme object is fine!
}));

// Critical: Disable native driver for Jest to allow JS-based value updates
jest.mock(
  "react-native/Libraries/Animated/NativeAnimatedHelper",
  () => ({
    shouldUseNativeDriver: () => false,
  }),
  { virtual: true },
);

const fakeSource = { uri: "@assets/logo.png" };

describe("Logo Component", () => {
  // THE SETUP: Animations run forever. We tell Jest to freeze time so
  // the Animated.loop doesn't cause the test to run infinitely.
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // THE TEST: This is the actual robot doing the work.
  it("renders the animated image successfully", () => {
    // A. Setup our fake props

    // B. Render the component in our invisible test environment
    const { getByTestId } = render(<Logo source={fakeSource} size={150} />);

    // C. Search the invisible environment for the badge we added
    const imageElement = getByTestId("logo-image");

    // D. The Expectation: Does the element exist?
    expect(imageElement).toBeTruthy();
  });

  it("contains the correct width and height even if other styles exist", () => {
    const { getByTestId } = render(<Logo source={fakeSource} size={150} />);
    const imageElement = getByTestId("logo-image");

    // Flatten the style into one single object
    const flattenedStyle = StyleSheet.flatten(imageElement.props.style);

    // Use expect.objectContaining to check ONLY width and height
    // This will PASS even if there are 100 other style properties
    expect(flattenedStyle).toEqual(
      expect.objectContaining({
        width: 150,
        height: 150,
      }),
    );
  });
});

describe("Logo Animation", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // Make loop run just once in tests (prevents infinite looping behavior)
    jest.spyOn(Animated, "loop").mockImplementation((animation: any) => animation);

    // Deterministic timing mock: updates value at half-duration and at end
    jest.spyOn(Animated, "timing").mockImplementation((value: any, config: any) => {
      return {
        start: (cb?: any) => {
          const from =
            (typeof value?.__getValue === "function" && value.__getValue()) ?? value?._value ?? 0;

          const to = config.toValue;
          const duration = config.duration ?? 0;

          // halfway update
          setTimeout(
            () => {
              value.setValue(from + (to - from) / 2);
            },
            Math.floor(duration / 2),
          );

          // end update
          setTimeout(() => {
            value.setValue(to);
            cb?.({ finished: true });
          }, duration);
        },
        stop: jest.fn(),
        reset: jest.fn(),
      } as any;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper to extract the numeric value from an Animated.Value in tests
  const getVal = (anim: any) => {
    if (typeof anim === "number") return anim;
    if (anim?._value !== undefined) return anim._value;
    if (typeof anim?._getValue === "function") return anim._getValue();
    return undefined;
  };

  it("respects custom scale boundaries and timing provided via props", () => {
    const customAnimation = { scaleFrom: 0.5, scaleTo: 1.5, duration: 1000 };

    const { getByTestId } = render(<Logo source={fakeSource} animation={customAnimation} />);

    const readScale = () => {
      const img = getByTestId("logo-image");
      const flat = StyleSheet.flatten(img.props.style);
      return flat.transform?.find((t: any) => t.scale !== undefined)?.scale;
    };

    // A. Start
    expect(getVal(readScale())).toBe(0.5);

    // B. Halfway
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getVal(readScale())).toBeGreaterThan(0.5);
    expect(getVal(readScale())).toBeLessThan(1.5);

    // C. Peak
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getVal(readScale())).toBe(1.5);
  });

  it("restarts the animation when the animation props change", () => {
    const firstAnim = { scaleFrom: 1, scaleTo: 1.1, duration: 1000 };
    const secondAnim = { scaleFrom: 2, scaleTo: 2.1, duration: 1000 };

    const { rerender, getByTestId } = render(<Logo source={fakeSource} animation={firstAnim} />);

    // Update props
    rerender(<Logo source={fakeSource} animation={secondAnim} />);

    const image = getByTestId("logo-image");
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    const scaleAnim = flattenedStyle.transform?.find((t: any) => t.scale !== undefined)?.scale;

    // It should have reset to the new scaleFrom
    expect(getVal(scaleAnim)).toBe(2);
  });
});
