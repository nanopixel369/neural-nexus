module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin must stay LAST
      'react-native-reanimated/plugin',
    ],
  };
};
