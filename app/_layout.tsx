import { Slot } from "expo-router";
import { ThemeProvider } from "@themes/ThemeContext";
import { View } from "react-native";
import { Provider } from "react-redux";
import store from "@store/store";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";


/**
 * Root layout for the whole app.
 *
 * Purpose:
 * - Wraps every screen with global providers (ThemeProvider, later: store, i18n, etc.)
 * - Renders the active route via <Slot />
 * - Lock screen orientation
 * - Hide Android navigation bar
 * - Hide status bar
 * - Provide global theme
 */
export default function Layout() {

  useEffect(() => {
    // Lock orientation to portrait
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );

    // 📱 Hide Android bottom navigation bar
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

  }, []);


  return (
    <Provider store={store}>
      <ThemeProvider>
        <View style={{ flex: 1, borderRadius: 0, overflow: "visible" }}>
          <StatusBar hidden />
          <Slot />
        </View>
      </ThemeProvider>
    </Provider>
  );
}