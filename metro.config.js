// @ts-check
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Windows: tránh lỗi Metro "Error: spawn UNKNOWN" (errno -4094) khi jest-worker fork
// transformer — hay gặp khi đường dẫn project có dấu cách hoặc Node 22.
config.maxWorkers = 1;

module.exports = config;
