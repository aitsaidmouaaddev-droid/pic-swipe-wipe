import React, { useEffect, useRef } from "react";
import { Animated, ImageSourcePropType } from "react-native";

/**
 * Configuration options for the logo's breathing/pulse animation.
 */
type LogoAnimation = {
  /** The starting scale multiplier. @default 0.95 */
  scaleFrom?: number;
  /** The peak scale multiplier. @default 1.05 */
  scaleTo?: number;
  /** Duration of a single half-cycle (in milliseconds). @default 900 */
  duration?: number;
};

/**
 * Props for the {@link Logo} component.
 */
type Props = {
  /** The image source for the logo (local file or URI). */
  source: ImageSourcePropType;
  /** The square dimensions (width and height) of the image. @default 120 */
  size?: number;
  /** Optional custom animation parameters. */
  animation?: LogoAnimation;
};

/**
 * A specialized Image component that renders a logo with a continuous
 * "breathing" or pulsing animation effect.
 * * @example
 * ```tsx
 * <Logo
 * source={require('./assets/icon.png')}
 * size={150}
 * animation={{ scaleTo: 1.2, duration: 1000 }}
 * />
 * ```
 */
export default function Logo({ source, size = 120, animation }: Props) {
  const { scaleFrom, scaleTo, duration } = {
    scaleFrom: 0.95,
    scaleTo: 1.05,
    duration: 900,
    ...(animation ?? {}),
  };

  const scale = useRef(new Animated.Value(scaleFrom)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // stop previous animation (important when props change)
    running.current?.stop();

    // reset to the new start boundary (ensures consistency on prop updates)
    scale.setValue(scaleFrom);

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: scaleTo,
          duration,
          useNativeDriver: false, // keeps it testable in Jest
        }),
        Animated.timing(scale, {
          toValue: scaleFrom,
          duration,
          useNativeDriver: false,
        }),
      ]),
    );

    running.current = anim;
    anim.start();

    return () => {
      anim.stop();
    };
  }, [scale, scaleFrom, scaleTo, duration]);

  return (
    <Animated.Image
      testID="logo-image"
      source={source}
      style={{
        width: size,
        height: size,
        transform: [{ scale }],
      }}
      resizeMode="contain"
    />
  );
}
