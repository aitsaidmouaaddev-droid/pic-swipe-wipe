module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          alias: {
            "@services/*": ["./app/services"],
            "@config": ["./app/config.ts"],
            "@components/*": ["./app/components"],
            "@hooks/*": ["./app/hooks"],
            "@mocks/*": ["./mocks"],
            "@themes/*": ["./styles/themes"],
            "@styles/*": ["./styles"],
            "@store/*": ["./app/store"],
            "@ui/*": ["./app/ui"],
          },
        },
      ],
    ],
  };
};
