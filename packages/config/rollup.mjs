import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";
import { terser } from "rollup-plugin-terser";

export const makeRollupConfig = (source, destination, outputOptions) =>
  defineConfig({
    input: `${source}.js`,
    output: [
      {
        file: `${destination}.js`,
        format: "iife",
        exports: "default",
        sourcemap: true,
        ...outputOptions,
      },
      {
        file: `${destination}.min.js`,
        format: "iife",
        exports: "default",
        sourcemap: true,
        plugins: [terser()],
        ...outputOptions,
      },
    ],
    plugins: [
      resolve(),
      babel({ babelHelpers: "bundled", extends: "@jspsych/config/babel.build.config.js" }),
    ],
  });

export const makeRollupConfigForPlugin = (iifeName) => ({
  ...makeRollupConfig("src/index", "dist/index", {
    name: iifeName,
    globals: { jspsych: "jsPsych" },
  }),
  external: ["jspsych"],
});
