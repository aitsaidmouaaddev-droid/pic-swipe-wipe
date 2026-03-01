import { StylesOverride, ThemeTokens } from "@themes/theme";
import { StyleSheet, ViewStyle } from "react-native";
import { IconStyles } from "@ui/icon/icon.style";
import { ButtonStyles } from "@ui/button/button.style";

export type VideoPlayerShape = {
  container: ViewStyle;
  videoView: ViewStyle;
  feedbackContainer: ViewStyle;
  feedbackIcon: ViewStyle;
  muteButtonContainer: ViewStyle;

  /** ✅ Type imbriqué */
  gestures: {
    container: ViewStyle;
    hitZone: ViewStyle;
  };

  progressBar: {
    container: ViewStyle;
    hitSlop: ViewStyle;
    track: ViewStyle;
    fill: ViewStyle;
    knob: ViewStyle;
  };

  icon: IconStyles;
  muteButton: ButtonStyles;
};

export default function makeVideoStyles(theme: ThemeTokens): VideoPlayerShape {
  const flats = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || "#000",
      overflow: "hidden",
      borderRadius: 0,
    },
    videoView: { flex: 1, borderRadius: 0 },
    feedbackContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 15,
      pointerEvents: "none",
    },
    feedbackIcon: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    muteButtonContainer: {
      position: "absolute",
      right: 20,
      zIndex: 30,
    },
    // ✅ On le nomme différemment pour l'extraire après
    gesturesContainerBase: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
    },
  });

  // On extrait gesturesContainerBase pour ne pas le polluer dans le spread final
  const { gesturesContainerBase, ...otherFlats } = flats;

  return {
    ...otherFlats,
    // ✅ On respecte maintenant la Shape imbriquée
    gestures: {
      container: gesturesContainerBase,
      hitZone: {
        flex: 1, // Style par défaut pour tes zones de tap
      },
    },
    progressBar: {
      container: {
        position: "absolute",
        left: 20,
        right: 20,
        height: 30,
        justifyContent: "center",
        zIndex: 20,
      },
      hitSlop: { height: 40, justifyContent: "center" },
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
    },
    icon: {
      container: {},
      vectorIcon: { color: "#FFF" },
    },
    muteButton: {
      base: {
        borderRadius: 50,
        width: 44,
        height: 44,
        backgroundColor: theme.colors.background,
        borderWidth: 0,
      },
    },
  };
}

export type VideoPlayerStyles = StylesOverride<VideoPlayerShape>;
