import { Slot } from "expo-router";
import { ThemeProvider } from "@themes/ThemeContext";
import { View } from "react-native";
import { Provider } from "react-redux";
import store from "@store/store";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import StorybookUI from "../.rnstorybook";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Root layout and global provider wrapper for the entire application.
 *
 * This component acts as the highest level of the app's component tree. It wraps
 * every screen with essential global state providers and applies critical
 * device-level UI configurations immediately upon mounting.
 *
 * **Key Responsibilities:**
 * - Injects the global Redux {@link store} via the `<Provider>`.
 * - Injects the custom {@link ThemeProvider} for app-wide styling.
 * - Renders the currently active route using Expo Router's `<Slot />` OR Storybook UI.
 * - Locks the device screen orientation strictly to Portrait mode.
 * - Hides the system Status Bar for a fully immersive, full-screen experience.
 * - Hides the Android bottom navigation bar (setting behavior to `overlay-swipe`).
 *
 * @returns The fully wrapped application component tree.
 */
export default function Layout() {
  // Check if Storybook mode is triggered via environment variables
  const SHOW_STORYBOOK = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

  useEffect(() => {
    // Lock orientation to portrait
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    // 📱 Hide Android bottom navigation bar
    NavigationBar.setVisibilityAsync("hidden");
    //NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, borderRadius: 0, overflow: "visible" }}>
            <StatusBar hidden />

            {/* Toggle between the application routing (Slot) and the 
            component sandbox (StorybookUI) based on the terminal command.
          */}
            {SHOW_STORYBOOK ? <StorybookUI /> : <Slot />}
          </View>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}
