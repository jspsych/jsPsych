/**
 * Webpack configuration to compile `src/index.scss` => `css/jspsych.css` and inline font files
 */

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const path = require("path");

const outputPath = path.resolve(__dirname, "css");
const outputFilename = "jspsych.css";

module.exports = {
  mode: "development",
  entry: "./src/index.scss",
  output: { path: outputPath },
  plugins: [
    new MiniCssExtractPlugin({ filename: outputFilename }),
    new RemoveEmptyScriptsPlugin(),
    new ReplaceInFileWebpackPlugin([
      // Remove .woff format in favor of .woff2
      {
        dir: outputPath,
        files: [outputFilename],
        rules: [{ search: /, url\(.*\) format\('woff'\)/g, replace: "" }],
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.woff2?(\?[a-z0-9=&.]+)?$/,
        use: ["base64-inline-loader"],
        type: "javascript/auto",
      },
      {
        test: /\.scss$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader", "sass-loader"],
      },
    ],
  },
};
