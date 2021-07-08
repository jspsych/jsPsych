import { babel } from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import ts from "typescript";

export const makeRollupConfig = (outputOptions, globalOptions = {}) => {
  const source = "src/index";
  const destination = "dist/index";

  outputOptions = {
    sourcemap: true,
    ...outputOptions,
  };

  const commonConfig = {
    input: `${source}.ts`,
    plugins: [
      resolve(),
      typescript({
        typescript: ts,
        tsconfigOverride: {
          compilerOptions: {
            rootDir: "./src",
            outDir: "./dist",
            paths: {}, // Do not include files referenced via paths
          },
        },
      }),
      json(),
    ],
    ...globalOptions,
  };

  return defineConfig([
    {
      // Non-babel builds
      ...commonConfig,
      output: [
        {
          // Build file to be used as an ES import
          file: `${destination}.js`,
          format: "esm",
          ...outputOptions,
        },
        {
          // Build file to be used for tinkering in modern browsers
          file: `${destination}.browser.js`,
          format: "iife",
          exports: "default",
          ...outputOptions,
        },
      ],
    },
    {
      // Babel build
      ...commonConfig,
      plugins: commonConfig.plugins.concat(
        babel({
          babelHelpers: "bundled",
          extends: "@jspsych/config/babel.config.js",
        })
      ),
      output: [
        {
          // Minified production build file
          file: `${destination}.browser.min.js`,
          format: "iife",
          exports: "default",
          plugins: [terser()],
          ...outputOptions,
        },
      ],
    },
  ]);
};

export const makeRollupConfigForPlugin = (iifeName) =>
  makeRollupConfig(
    {
      name: iifeName,
      globals: { jspsych: "jsPsych" },
    },
    { external: ["jspsych"] }
  );
