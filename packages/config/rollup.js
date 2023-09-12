import { readFileSync } from "node:fs";

import { DEFAULT_EXTENSIONS as babelDefaultExtensions } from "@babel/core";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import ts from "typescript";

const getPackageInfo = () => {
  const { name, version } = JSON.parse(readFileSync("./package.json"));
  return { name, version };
};

const makeConfig = ({
  outputOptions = {},
  globalOptions = {},
  iifeOutputOptions = {},
  isNodeOnlyBuild = false,
}) => {
  const source = "src/index";
  const destinationDirectory = "dist";
  const destination = `${destinationDirectory}/index`;

  outputOptions = {
    sourcemap: true,
    ...outputOptions,
  };

  const commonConfig = defineConfig({
    input: `${source}.ts`,
    plugins: [
      resolve({ preferBuiltins: isNodeOnlyBuild }),
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

  let sourcemapBaseUrl;
  if (!isNodeOnlyBuild) {
    // In builds that are published to NPM (potentially every CI build), point to sourcemaps via the
    // package's canonical unpkg URL
    if (process.env.CI) {
      const { name, version } = getPackageInfo();
      sourcemapBaseUrl = `https://unpkg.com/${name}@${version}/${destinationDirectory}/`;
    }

    output.push({
      // Build file to be used for tinkering in modern browsers
      file: `${destination}.browser.js`,
      format: "iife",
      sourcemapBaseUrl,
      ...outputOptions,
      ...iifeOutputOptions,
    });
  }

  // Non-babel builds
  const config = defineConfig([{ ...commonConfig, output }]);

  if (!isNodeOnlyBuild) {
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
          sourcemapBaseUrl,
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
    isNodeOnlyBuild: true,
  });
