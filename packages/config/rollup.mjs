import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
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
    exports: "default", // for iife outputs
    ...outputOptions,
  };

  const commonConfig = defineConfig({
    input: `${source}.ts`,
    plugins: [
      resolve(),
      typescript({
        typescript: ts,
        tsconfigDefaults: {
          exclude: ["./tests", "**/*.spec.ts", "**/*.test.ts", "./dist"],
        },
        tsconfigOverride: {
          compilerOptions: {
            rootDir: "./src",
            outDir: "./dist",
            paths: {}, // Do not include files referenced via paths
          },
        },
      }),
      json(),
      commonjs(),
    ],
    ...globalOptions,
  });

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
      globals: { jspsych: "jsPsychModule" },
    },
    { external: ["jspsych"] }
  );
