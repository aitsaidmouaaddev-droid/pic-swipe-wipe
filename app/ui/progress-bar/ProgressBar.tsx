import useResultedStyle from "@hooks/useResultedStyle.hook";
import { useTheme } from "@themes/ThemeContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import makeProgressBarStyles, { ProgressBarStyles } from "./progressBar.style";

export type ProgressBarVariant = "linear" | "circular";

export interface ProgressBarProps {
  /** Value between 0 and 1 (ignored if isInfinite = true). */
  value?: number;

  /** Indeterminate mode (infinite loop). */
  isInfinite?: boolean;

  /** linear | circular */
  variant?: ProgressBarVariant;

  /** Circle diameter (only for circular). */
  size?: number;

  /** Circle stroke width (only for circular). */
  strokeWidth?: number;

  stylesOverride?: Partial<ProgressBarStyles>;
}

const clamp01 = (v: number) => Math.max(0, Math.min(v, 1));

export default function ProgressBar({
  value = 0,
  isInfinite = false,
  variant = "linear",
  size = 56,
  strokeWidth = 6,
  stylesOverride,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const styles = useResultedStyle<ProgressBarStyles>(theme, makeProgressBarStyles, stylesOverride);

  const v = clamp01(value);
  const pct = useMemo(() => Math.round(v * 100), [v]);

  // ---- Infinite animations ----
  const spin = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  // For linear indeterminate we need track width to translate in pixels
  const [trackWidth, setTrackWidth] = useState<number>(0);

  useEffect(() => {
    // stop animations when toggling mode/variant
    spin.stopAnimation();
    slide.stopAnimation();
    spin.setValue(0);
    slide.setValue(0);

    if (!isInfinite) return;

    if (variant === "circular") {
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
      return;
    }

    // variant === "linear"
    if (trackWidth <= 0) return;

    const barWidth = Math.max(24, Math.round(trackWidth * 0.35));
    slide.setValue(-barWidth);

    Animated.loop(
      Animated.timing(slide, {
        toValue: trackWidth + barWidth,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, [isInfinite, variant, trackWidth, spin, slide]);

  // ---- Render helpers ----
  const renderLinear = () => {
    const widthStyle = isInfinite ? undefined : { width: `${v * 100}%` };

    return (
      <View style={styles.linearWrapper}>
        <View
          style={styles.track}
          testID="progress-track"
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          {isInfinite ? (
            <Animated.View
              testID="progress-fill"
              style={[
                styles.fill,
                // dynamic "indeterminate bar" width + translation
                {
                  width: Math.max(24, Math.round(trackWidth * 0.35)),
                  transform: [{ translateX: slide }],
                },
              ]}
            />
          ) : (
            <View testID="progress-fill" style={[styles.fill, widthStyle]} />
          )}
        </View>

        {!isInfinite && <Text style={styles.linearLabel}>{pct}%</Text>}
      </View>
    );
  };

  const renderCircular = () => {
    const s = size;
    const sw = strokeWidth;
    const radius = (s - sw) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - v);

    const rotate = spin.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    // For indeterminate we show a “segment” and rotate it
    const indeterminateDash = `${Math.max(8, circumference * 0.25)} ${circumference}`;

    const svg = (
      <Svg width={s} height={s}>
        <Circle
          cx={s / 2}
          cy={s / 2}
          r={radius}
          strokeWidth={sw}
          stroke={theme.colors.track}
          fill="transparent"
        />

        {isInfinite ? (
          <Circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            strokeWidth={sw}
            stroke={theme.colors.primary}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={indeterminateDash}
            transform={`rotate(-90 ${s / 2} ${s / 2})`}
          />
        ) : (
          <Circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            strokeWidth={sw}
            stroke={theme.colors.primary}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${s / 2} ${s / 2})`}
          />
        )}
      </Svg>
    );

    return (
      <View style={[styles.circleWrapper, { width: s, height: s }]} testID="progress-circle">
        {isInfinite ? (
          <Animated.View style={{ transform: [{ rotate }] }}>{svg}</Animated.View>
        ) : (
          svg
        )}

        {!isInfinite && (
          <View style={styles.circleLabelContainer} pointerEvents="none">
            <Text style={styles.circleLabel}>{pct}%</Text>
          </View>
        )}
      </View>
    );
  };

  return variant === "circular" ? renderCircular() : renderLinear();
}
