/**
 * @file videoPlayer.style.ts
 */
import { ThemeTokens } from "@themes/theme";
import { StyleSheet } from "react-native";

export const makeVideoStyles = (theme: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || "#000",
      borderRadius: 0,
      overflow: "hidden",
    },
    gestureOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
    },
    // --- Nouveau : Styles pour le Feedback visuel ---
    feedbackContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 15, // Entre la vidéo et les contrôles
      pointerEvents: "none", // Important : ne doit pas bloquer les touches
    },
    feedbackIcon: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    // -----------------------------------------------
    progressContainer: {
      position: "absolute",
      left: 20,
      right: 20,
      height: 30,
      justifyContent: "center",
      zIndex: 20,
    },
    progressHitSlop: {
      height: 40,
      justifyContent: "center",
    },
    track: {
      height: 6,
      backgroundColor: theme.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
      borderRadius: 3,
    },
    fill: {
      height: "100%",
      backgroundColor: theme.colors.primary || "#6200EE",
      borderRadius: 3,
    },
    knob: {
      position: "absolute",
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary || "#6200EE",
      top: -5,
      marginLeft: -8,
      elevation: 4,
    },
    muteButtonContainer: {
      position: "absolute",
      right: 20,
      zIndex: 30,
    },
    muteButton: {
      borderRadius: 50,
      width: 44,
      height: 44,
      backgroundColor: theme.colors.background,
      borderWidth: 0,
    },
    videoView: {
      flex: 1,
    },
  });
