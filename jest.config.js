module.exports = {
  verbose: true,
  setupFilesAfterEnv: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?@react-native|react-native|react-clone-referenced-element|react-navigation|@react-navigation/.*|native-base))",
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    // 🎯 This is the fix.
    // It tells Jest: "When you see @themes, look in the styles/themes folder"
    "^@themes/(.*)$": "<rootDir>/styles/themes/$1",

    // Add these if you use them in your imports:
    "^@ui/(.*)$": "<rootDir>/app/ui/$1",
    "^@store/(.*)$": "<rootDir>/app/store/$1",

    // This handles the Expo Winter bug we fought earlier
    "^expo/src/winter/(.*)$": "<rootDir>/__mocks__/expo-winter-dummy.js",
  },
};
