// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * ✅ Fix expo-sqlite on web:
 * Metro must treat ".wasm" as an asset so imports like:
 *   import wasmModule from "./wa-sqlite.wasm"
 * can be resolved during bundling/export.
 */
config.resolver.assetExts = [...(config.resolver.assetExts ?? []), "wasm"];

/**
 * 🎯 Ignore test/spec files in the bundling process
 * (prevents Metro from trying to bundle your tests)
 */
const testBlockRegex = /[/\\]app[/\\].*\.(test|spec)\.(js|ts|jsx|tsx)$/;

// Metro's blockList can be either:
// - a function (from metro-config), or
// - an array (older patterns / custom merges)
// We handle both cases.
if (typeof config.resolver.blockList === "function") {
  const previous = config.resolver.blockList;
  config.resolver.blockList = (filepath) =>
    previous(filepath) || testBlockRegex.test(filepath);
} else {
  config.resolver.blockList = [
    ...(config.resolver.blockList ?? []),
    testBlockRegex,
  ];
}

module.exports = config;
