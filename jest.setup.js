import "react-native-gesture-handler/jestSetup";

// 🛑 STOP the Icon "act" warning at the source
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  // We return a simple function component (no state = no act warning)
  const MockIcon = (props) => React.createElement(View, props);
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    AntDesign: MockIcon,
    MaterialCommunityIcons: MockIcon,
    createIconSet: () => MockIcon,
  };
});

// Mock expo-font so it doesn't try to load anything asynchronously
jest.mock("expo-font", () => ({
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
}));

// Mock expo-modules-core
jest.mock("expo-modules-core", () => ({
  ...jest.requireActual("expo-modules-core"),
  EventEmitter: class {
    addListener = jest.fn();
    removeListeners = jest.fn();
  },
  NativeModulesProxy: { NativeUnimoduleProxy: {} },
}));

global.process.env.EXPO_OS = "ios";
