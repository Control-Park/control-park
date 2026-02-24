module.exports = function (api) {
  api.cache(true);
  // caches translations
  return {
    // translates Tailwind classes for react native
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
