import * as React from "react";
import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import Logo from "@ui/logo/Logo";
import makeLoadingScreenStyles from "./loadingScreen.style";
import ProgressBar from "@ui/progress-bar/ProgressBar";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { scanDevicePhotos } from "@store/mediaScanSlice";

/**
 * Props for {@link LoadingScreen}.
 */
export interface LoadingScreenProps {
  /**
   * Optional main text displayed under the logo.
   * Example: "Loading your library"
   */
  loadingText?: string;

  /**
   * Image source passed to the Logo component.
   */
  logoSource: Parameters<typeof Logo>[0]["source"];

  /**
   * Pixel size of the logo.
   * @defaultValue 220
   */
  logoSize?: number;
}

/**
 * LoadingScreen
 *
 * Responsibilities:
 * 1) Ask for media permissions
 * 2) Scan device (or mock) media
 * 3) Display progress bar linked to scan progress
 * 4) Navigate to Home when scan is complete
 *
 * This screen should be the ONLY place where scanning is triggered.
 */
export default function LoadingScreen({
  loadingText,
  logoSource,
  logoSize = 220,
}: LoadingScreenProps) {
  /**
   * Theme access (colors, spacing, etc.)
   */
  const { theme } = useTheme();
  const styles = makeLoadingScreenStyles(theme);

  /**
   * Redux hooks
   */
  const dispatch = useAppDispatch();
  const { permission, isScanning, progress, items, error } = useAppSelector(
    (s) => s.mediaScan
  );

  /**
   * Start scan ONCE when screen mounts
   */
  useEffect(() => {
    dispatch(scanDevicePhotos());
  }, [dispatch]);

  /**
   * Navigate to Home ONLY when:
   * - scanning finished
   * - AND at least one media item exists
   */
  useEffect(() => {
    if (!isScanning && items.length > 0) {
      router.replace("/(tabs)/HomeTab");
    }
  }, [isScanning, items.length]);

  /**
   * Human-readable status message under title
   */
  const subtitle =
    permission === "granted"
      ? isScanning
        ? "Permission granted. Scanning media…"
        : "Scan complete."
      : permission === "denied"
      ? "Permission denied."
      : "Requesting permissions…";

  return (
    <View style={styles.container}>
      {/* App logo */}
      <Logo source={logoSource} size={logoSize} />

      {/* Main title */}
      {loadingText ? <Text style={styles.title}>{loadingText}</Text> : null}

      {/* Status message */}
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Progress bar */}
      <View style={styles.bottom}>
        <ProgressBar value={progress} />
      </View>

      {/* Error display */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}