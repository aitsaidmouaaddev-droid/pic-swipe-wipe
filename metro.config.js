const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🎯 Ignore test files in the bundling process
config.resolver.blockList = [
  ...((config.resolver && config.resolver.blockList) || []),
  // This regex matches any file ending in .test.js/ts/jsx/tsx or .spec.js/ts/jsx/tsx
  /[/\\]app[/\\].*\.(test|spec)\.(js|ts|jsx|tsx)$/,
];

module.exports = config;
