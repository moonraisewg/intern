const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    background: './src/background/background.ts',
    contentScript: './src/content/contentScript.ts',
    popup: './src/popup/popup.ts',
    provider: './src/provider.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false
    }
  },
  optimization: {
    minimize: false
  },
  experiments: {
    topLevelAwait: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/popup/popup.html", to: "popup.html" },
        { from: "src/popup/style.css", to: "styles.css" }
      ],
    }),
  ]
}; 