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

// Mock de expo-video
jest.mock("expo-video", () => ({
  createVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replaceAsync: jest.fn(() => Promise.resolve()),
    seekBy: jest.fn(),
    release: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    playing: false,
    muted: false,
    currentTime: 0,
    duration: 10,
  })),
  VideoView: "VideoView",
}));

// Mock de expo (useEventListener)
jest.mock("expo", () => ({
  useEventListener: jest.fn(),
}));

// ✅ Required for any component using react-native-reanimated hooks
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), { virtual: true });

global.process.env.EXPO_OS = "ios";
