/**
 * Webpack configuration to compile the stylesheets in `src/` => `css/` and inline font files.
 *
 * Each entry name becomes an output filename, so `src/index.scss` => `css/jspsych.css` and
 * `src/mobile.scss` => `css/jspsych-mobile.css`.
 */

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const path = require("path");

const outputPath = path.resolve(__dirname, "css");

// Only index.scss imports the font files, so the .woff cleanup below applies to it alone.
const fontStylesheet = "jspsych.css";

module.exports = {
  mode: "development",
  entry: {
    jspsych: "./src/index.scss",
    "jspsych-mobile": "./src/mobile.scss",
  },
  output: { path: outputPath },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new RemoveEmptyScriptsPlugin(),
    new ReplaceInFileWebpackPlugin([
      // Remove .woff format in favor of .woff2
      {
        dir: outputPath,
        files: [fontStylesheet],
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
