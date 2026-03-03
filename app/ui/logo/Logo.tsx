import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ImageSourcePropType } from "react-native";
import makeLogoStyles, { LogoStyles } from "./logo.style";

type LogoAnimation = {
  scaleFrom?: number;
  scaleTo?: number;
  duration?: number;
};

type LogoProps = {
  stylesOverride?: Partial<LogoStyles>;
  source: ImageSourcePropType;
  size?: number;
  animation?: LogoAnimation;
  testID?: string;
};

/**
 * A specialized Image component with a continuous breathing animation.
 * Supports theme-based styling and manual overrides.
 */
export default function Logo({
  source,
  size = 120,
  animation,
  stylesOverride,
  testID = "logo-image",
}: LogoProps) {
  const { theme } = useTheme();

  // ✅ Intégration du système de styles résultants
  const styles = useResultedStyle<LogoStyles>(theme, makeLogoStyles, stylesOverride);

  const { scaleFrom, scaleTo, duration } = useMemo(
    () => ({
      scaleFrom: 0.95,
      scaleTo: 1.05,
      duration: 900,
      ...(animation ?? {}),
    }),
    [animation],
  );

  const scale = useRef(new Animated.Value(scaleFrom)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    running.current?.stop();
    scale.setValue(scaleFrom);

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: scaleTo,
          duration,
          useNativeDriver: false, // false pour la compatibilité Jest
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

    return () => anim.stop();
  }, [scale, scaleFrom, scaleTo, duration]);

  return (
    <Animated.Image
      testID={testID}
      source={source}
      style={[
        styles.image, // Style de base défini dans logo.style.ts
        {
          width: size,
          height: size,
          transform: [{ scale }],
        },
      ]}
      resizeMode="contain"
    />
  );
}
