import * as React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import Logo from "@ui/logo/Logo";
import makeLoadingScreenStyles from "./loadingScreen.style";



/**
 * Props for {@link LoadingScreen}.
 */
export interface LoadingScreenProps {
  /** Progress from 0 to 100. */
  progress: number;

  /** Optional text displayed above the progress bar. */
  loadingText?: string;

  /** Logo image source */
  logoSource: Parameters<typeof Logo>[0]["source"];

  /** Optional logo size */
  logoSize?: number;
}

/**
 * Loading screen UI (presentational).
 * Logic (timers, permissions, scanning) stays outside.
 */
export default function LoadingScreen({
  progress,
  loadingText,
  logoSource,
  logoSize = 220,
}: LoadingScreenProps) {
  const { theme } = useTheme();
  const styles = makeLoadingScreenStyles(theme);

  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.container}>
      <Logo source={logoSource} size={logoSize} />

      {loadingText ? (
        <Text style={styles.subtitle}>
          {loadingText} {safeProgress}%
        </Text>
      ) : null}

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${safeProgress}%` }]} />
      </View>
    </View>
  );
}