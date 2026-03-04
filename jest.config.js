module.exports = {
  verbose: true,
  preset: "jest-expo", // 🎯 Use jest-expo preset for better compatibility
  setupFilesAfterEnv: [
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/jest.setup.js",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@expo/vector-icons)",
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    // 🎯 FIX 1: Removed the double "app/app" typo.
    // It's now pointing correctly to <rootDir>/app/ui/
    "^@ui/(.*)$": "<rootDir>/app/ui/$1",

    "^@themes/(.*)$": "<rootDir>/styles/themes/$1",
    "^@store/(.*)$": "<rootDir>/app/store/$1",

    // 🎯 FIX 2: Removed the hardcoded "@expo/vector-icons" mapping.
    // Mapping it to /build/index.js was causing the "Could not locate" error.
    // By removing this, Jest will find the package normally, and your
    // jest.mock() inside the test file will take over properly.
  },
};
