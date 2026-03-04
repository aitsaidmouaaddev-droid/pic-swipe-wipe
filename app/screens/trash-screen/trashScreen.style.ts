import { ThemeTokens } from "@themes/theme";
import { StyleSheet, Platform, ViewStyle, TextStyle } from "react-native";

// Use your defined offsets
const MUTE_BUTTON_OFFSET = 130;

export default function makeTrashScreenStyles(theme: ThemeTokens) {
  return {
    overlayContainer: {
      ...StyleSheet.absoluteFillObject,
      // We remove horizontal padding here to allow children
      // to pin exactly to edges if needed
    } as ViewStyle,

    // 1. Position the Filter at Top Right

    // 2. Position the Trash Button at the same level as Mute Button
    wipeButtonContainer: {
      position: "absolute" as const,
      bottom: MUTE_BUTTON_OFFSET,
      left: 20,
      zIndex: 10,
    } as ViewStyle,

    filterContainer: {
      position: "absolute" as const,
      top: Platform.OS === "ios" ? 60 : 40,
      right: 20,
      zIndex: 10,
    } as ViewStyle,

    filterStyles: {
      borderRadius: 50,
      width: 54,
      height: 54,
      backgroundColor: theme.colors.background + "CC",
    } as ViewStyle,

    deleteButton: {
      borderRadius: 50,
      width: 54,
      height: 54,
      backgroundColor: theme.colors.background + "CC",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: 0,
      minWidth: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    } as ViewStyle,

    deleteButtonContent: {
      padding: 0,
      margin: 0,
      height: "100%",
      width: "100%",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    } as ViewStyle,

    // ... footer styles remain the same if needed
    footerInfo: {
      position: "absolute" as const,
      bottom: 40,
      alignSelf: "center" as const,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    } as ViewStyle,

    footerText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    } as TextStyle,
  };
}
