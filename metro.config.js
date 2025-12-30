// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Block expo-sqlite web worker files that cause issues on web
config.resolver.blockList = [
  /node_modules\/expo-sqlite\/web\/worker\.ts/,
  /node_modules\/expo-sqlite\/web\/wa-sqlite\/.*/,
];

module.exports = config;

