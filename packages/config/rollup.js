import { readFileSync } from "node:fs";
import path from "path";

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import externals from "rollup-plugin-node-externals";
import ts from "typescript";

const getTsCompilerOptions = () => {
  const cwd = process.cwd();
  return ts.parseJsonConfigFileContent(
    ts.readConfigFile(path.join(cwd, "tsconfig.json"), ts.sys.readFile).config,
    ts.sys,
    cwd
  ).options;
};

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
  const input = "src/index.ts";
  const destinationDirectory = "dist";
  const destination = `${destinationDirectory}/index`;

  outputOptions = {
    sourcemap: true,
    ...outputOptions,
  };

  /** @type{import("rollup-plugin-esbuild").Options} */
  const esBuildPluginOptions = {
    loaders: { ".json": "json" },
  };

  /** @type{import("@rollup/plugin-commonjs").RollupCommonJSOptions} */
  const commonjsPluginOptions = {
    extensions: [".js", ".json"],
  };

  // Non-babel builds
  const config = defineConfig([
    // Type definitions (bundled as a single .d.ts file)
    {
      input,
      output: [{ file: `${destination}.d.ts`, format: "es" }],
      plugins: [
        dts({
          compilerOptions: {
            ...getTsCompilerOptions(),
            noEmit: false,
            paths: {}, // Do not include files referenced via `paths`
          },
        }),
      ],
    },

    // Module builds
    {
      ...globalOptions,
      input,
      plugins: [
        externals(),
        esbuild({ ...esBuildPluginOptions, target: "node18" }),
        commonjs(commonjsPluginOptions),
      ],
      output: [
        { file: `${destination}.js`, format: "esm", ...outputOptions },
        { file: `${destination}.cjs`, format: "cjs", ...outputOptions },
      ],
    },
  ]);

  if (!isNodeOnlyBuild) {
    // In builds that are published to NPM (potentially every CI build), point to sourcemaps via the
    // package's canonical unpkg URL
    let sourcemapBaseUrl;
    if (process.env.CI) {
      const { name, version } = getPackageInfo();
      sourcemapBaseUrl = `https://unpkg.com/${name}@${version}/${destinationDirectory}/`;
    }

    // IIFE build for tinkering in modern browsers
    config.push({
      ...globalOptions,
      input,
      plugins: [
        externals({ deps: false }),
        resolve({ preferBuiltins: false }),
        esbuild({ ...esBuildPluginOptions, target: "esnext" }),
        commonjs(commonjsPluginOptions),
      ],
      output: {
        file: `${destination}.browser.js`,
        format: "iife",
        sourcemapBaseUrl,
        ...outputOptions,
        ...iifeOutputOptions,
      },
    });

    // Minified production IIFE build
    config.push({
      ...globalOptions,
      input,
      plugins: [
        externals({ deps: false }),
        resolve({ preferBuiltins: false }),
        esbuild({ ...esBuildPluginOptions, target: "es2015", minify: true }),
        commonjs(commonjsPluginOptions),
      ],
      output: {
        file: `${destination}.browser.min.js`,
        format: "iife",
        sourcemapBaseUrl,
        ...outputOptions,
        ...iifeOutputOptions,
      },
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
