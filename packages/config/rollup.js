import { DEFAULT_EXTENSIONS as babelDefaultExtensions } from "@babel/core";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { defineConfig } from "rollup";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import ts from "typescript";

const makeConfig = ({
  outputOptions = {},
  globalOptions = {},
  iifeOutputOptions = {},
  nodeOnly = false,
}) => {
  const source = "src/index";
  const destination = "dist/index";

  outputOptions = {
    sourcemap: true,
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
            paths: {}, // Do not include files referenced via `paths`
          },
        },
      }),
      json(),
      commonjs(),
    ],
    ...globalOptions,
  });

  /** @type {import("rollup").OutputOptions} */
  const output = [
    {
      // Build file to be used as an ES import
      file: `${destination}.js`,
      format: "esm",
      ...outputOptions,
    },
    {
      // Build commonjs module (for tools that do not fully support ES6 modules)
      file: `${destination}.cjs`,
      format: "cjs",
      ...outputOptions,
    },
  ];

  if (!nodeOnly) {
    output.push({
      // Build file to be used for tinkering in modern browsers
      file: `${destination}.browser.js`,
      format: "iife",
      ...outputOptions,
      ...iifeOutputOptions,
    });
  }

  // Non-babel builds
  const config = defineConfig([{ ...commonConfig, output }]);

  if (!nodeOnly) {
    // Babel build
    config.push({
      ...commonConfig,
      plugins: [
        // Import `regenerator-runtime` if requested:
        replace({
          values: {
            "// __rollup-babel-import-regenerator-runtime__":
              'import "regenerator-runtime/runtime.js";',
          },
          delimiters: ["", ""],
          preventAssignment: true,
        }),
        ...commonConfig.plugins,
        babel({
          babelHelpers: "bundled",
          extends: "@jspsych/config/babel",
          // https://github.com/ezolenko/rollup-plugin-typescript2#rollupplugin-babel
          extensions: [...babelDefaultExtensions, ".ts"],
        }),
      ],
      output: [
        {
          // Minified production build file
          file: `${destination}.browser.min.js`,
          format: "iife",
          plugins: [terser()],
          ...outputOptions,
          ...iifeOutputOptions,
        },
      ],
    });
  }

  return config;
};

/**
 * Returns a Rollup configuration object for a JsPsych plugin or extension that is written in
 * TypeScript
 *
 * @param {string} iifeName The variable name that will identify the plugin or extension in the
 * global scope in browser builds
 */
export const makeRollupConfig = (iifeName) =>
  makeConfig({
    outputOptions: {
      exports: "default",
      globals: { jspsych: "jsPsychModule" },
    },
    globalOptions: { external: ["jspsych"] },
    iifeOutputOptions: { name: iifeName },
  });

/**
 * Returns the rollup configuration for the core `jspsych` package.
 */
export const makeCoreRollupConfig = () =>
  makeConfig({
    outputOptions: {
      exports: "named",
      name: "jsPsychModule",
    },
    iifeOutputOptions: { footer: "var initJsPsych = jsPsychModule.initJsPsych;" },
  });

/**
 * Returns the rollup configuration for Node.js-only packages
 */
export const makeNodeRollupConfig = () =>
  makeConfig({
    globalOptions: { external: ["jspsych"] },
    nodeOnly: true,
  });
