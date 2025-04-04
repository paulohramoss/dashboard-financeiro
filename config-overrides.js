const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "url": require.resolve("url/"),
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "querystring": require.resolve("querystring-es3"),
    "os": require.resolve("os-browserify/browser"),
    "path": require.resolve("path-browserify"),
    "util": require.resolve("util/"),
    "zlib": require.resolve("browserify-zlib"),
    "assert": require.resolve("assert/"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "http2": false,
    "events": require.resolve("events/"),
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer/")
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: require.resolve("process/browser"),
      Buffer: ['buffer', 'Buffer']
    })
  ]);
  config.resolve.alias = {
    ...config.resolve.alias,
    'process': require.resolve("process/browser"),
    'events': require.resolve("events/"),
    'util': require.resolve("util/")
  };
  return config;
} 