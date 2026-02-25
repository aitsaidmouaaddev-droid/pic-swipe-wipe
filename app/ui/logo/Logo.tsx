import React, { useEffect, useRef } from "react";
import { Animated, type ImageSourcePropType } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeLogoStyles, { defaultLogoAnimation, type LogoAnimationPreset } from "./logo.style";

/**
 * Props for the {@link Logo} component.
 */
export interface LogoProps {
  /**
   * Image source for the logo (local require or remote URL).
   * @example require("../../assets/logo.gif")
   */
  source: ImageSourcePropType;

  /**
   * Size (width and height) of the logo in pixels.
   * @defaultValue `200`
   */
  size?: number;

  /**
   * Animation preset defining the scale limits and duration.
   * If omitted, {@link defaultLogoAnimation} is used.
   */
  animation?: LogoAnimationPreset;
}

/**
 * A themed, auto-animating logo component.
 *
 * **Key Features:**
 * - Consumes theme design tokens via the {@link useTheme} hook.
 * - Automatically runs a continuous, looping "breathing" (scale) animation
 * using the React Native `Animated` API.
 * - Cleans up its own animation loop to prevent memory leaks if unmounted.
 *
 * @returns The animated image component.
 */
export default function Logo({ source, size = 200, animation = defaultLogoAnimation }: LogoProps) {
  const { theme } = useTheme();
  const styles = makeLogoStyles(theme, size);

  // Initialize the animated value to the starting scale
  const scaleAnim = useRef(new Animated.Value(animation.scaleFrom)).current;

  useEffect(() => {
    // Define the looping animation
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: animation.scaleTo,
          duration: animation.duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: animation.scaleFrom,
          duration: animation.duration,
          useNativeDriver: true,
        }),
      ]),
    );

    // Start the animation
    loop.start();

    // Cleanup function: Stop the animation if the component unmounts
    // or if the animation props change, preventing overlapping loops.
    return () => loop.stop();
  }, [animation.duration, animation.scaleFrom, animation.scaleTo, scaleAnim]);

  return (
    <Animated.Image
      source={source}
      style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
      resizeMode="contain"
    />
  );
}
