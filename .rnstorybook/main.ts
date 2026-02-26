import type { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
  stories: ["../app/ui/**/*.stories.tsx"],
  addons: ["@storybook/addon-ondevice-controls", "@storybook/addon-ondevice-actions"],
};

export default main;
