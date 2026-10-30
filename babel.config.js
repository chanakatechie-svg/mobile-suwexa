module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-worklets/plugin supersedes react-native-reanimated/plugin
    // in Reanimated 4.x. It must stay LAST in the plugin list.
    plugins: ["react-native-worklets/plugin"],
  };
};
