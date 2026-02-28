// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  prettierConfig, // This adds the Prettier plugin AND turns off conflicting rules
  {
    ignores: [
      "jest.*",
      "dist/*",
      ".expo/*",
      "scripts/*",
      "docs/*",
      ".rnstorybook/*",
      "**/*.test.tsx",
      "**/*.stories.tsx", // 🎯 Ignore all story files
      "**/*.stories.ts", // 🎯 Ignore TS-only stories
      "**/storybook.requires.ts", // Ignore the auto-generated file
    ], // Good idea to ignore Expo's build folder too
  },
  {
    // Optional: If you want formatting issues to show up as warnings instead of errors
    rules: {
      "prettier/prettier": "warn",
    },
  },
]);
