const path = require('path');

module.exports = {
  // ... outras configurações existentes ...
  resolve: {
    fallback: {
      "url": require.resolve("url/"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser"),
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]
}; 