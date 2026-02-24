module.exports = function(api) {
  api.cache(true);
  // caches translations
  return {
    // translates Tailwind classes for react native
    presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
    plugins: [
      // 'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
}; 