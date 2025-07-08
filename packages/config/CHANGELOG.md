# @jspsych/config

## 3.3.0

### Minor Changes

- [#3561](https://github.com/jspsych/jsPsych/pull/3561) [`a25c47256c61a5fea67acf4a1fdf29024fe1ab21`](https://github.com/jspsych/jsPsych/commit/a25c47256c61a5fea67acf4a1fdf29024fe1ab21) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Add the minified version of the survey plugin CSS file, `survey.min.css`, to the dist archive.

## 3.2.2

### Patch Changes

- [#3488](https://github.com/jspsych/jsPsych/pull/3488) [`64a01292c350b5f6fd9f3f2e0dad5124262d53c9`](https://github.com/jspsych/jsPsych/commit/64a01292c350b5f6fd9f3f2e0dad5124262d53c9) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Replaces the dependency on `canvas` in `@jspsych/config` with `jest-canvas-mock`.

- [#3484](https://github.com/jspsych/jsPsych/pull/3484) [`e710cb01e8ab2f992d0be902016e3e6540197f67`](https://github.com/jspsych/jsPsych/commit/e710cb01e8ab2f992d0be902016e3e6540197f67) Thanks [@jadeddelta](https://github.com/jadeddelta)! - Patches some edge cases for `getCitations` and the build process that reads CITATION.CFF files to include citation info

## 3.2.1

### Patch Changes

- [#3486](https://github.com/jspsych/jsPsych/pull/3486) [`ad1d854f43c1e25ba988a3aa2a23a8ab22be3535`](https://github.com/jspsych/jsPsych/commit/ad1d854f43c1e25ba988a3aa2a23a8ab22be3535) Thanks [@jadeddelta](https://github.com/jadeddelta)! - remove DOM clearing after each individual test, fixes issues with testing in other repositories

## 3.2.0

### Minor Changes

- [#3385](https://github.com/jspsych/jsPsych/pull/3385) [`3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc`](https://github.com/jspsych/jsPsych/commit/3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc) Thanks [@cherriechang](https://github.com/cherriechang)! - Added citations property to info field of all plugins/extensions in two citation formats (apa, bibtex); added getCitations() as function in jsPsych package allowing user to generate citations by passing an array of plugins/extensions by name as first input and citation format as string as second input; changed template of plugins/extensions to contain citations field by default; citations for each plugin/extension are automatically generated from .cff file (if any) at its folder's root during build process; getCitations() prints out citations in the form of a string separating each citation with newline character, and always prints the jsPsych library citation first.

### Patch Changes

- [#3482](https://github.com/jspsych/jsPsych/pull/3482) [`a733fc685c8d1a3f1a9dea25bd4c70940885c6e9`](https://github.com/jspsych/jsPsych/commit/a733fc685c8d1a3f1a9dea25bd4c70940885c6e9) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixes gulp build process that was attempting to use glob v10 by adding glob v7 as explicit dependency. glob v9+ changed the API and would require some rewrites and testing before implementing

## 3.1.1

### Patch Changes

- [#3396](https://github.com/jspsych/jsPsych/pull/3396) [`d683396e`](https://github.com/jspsych/jsPsych/commit/d683396e5e6465f454625ec99675f76959a99e9b) Thanks [@bjoluc](https://github.com/bjoluc)! - Update dependencies for config.

  - `@rollup/plugin-common-js` updated to 26.0.1
  - `esbuild` updated to 0.23.1
  - `gulp` updated to 5.0.0
  - `gulp-cli` updated to 3.0.0
  - `rollup` updated to 4.21.2
  - `rollup-plugin-dts` updated to 6.1.1
  - `rollup-plugin-esbuild` updated to 6.1.1
  - `rollup-plugin-node-externals` updated to 7.1.3

## 3.1.0

### Minor Changes

- [#3435](https://github.com/jspsych/jsPsych/pull/3435) [`3de5aad4`](https://github.com/jspsych/jsPsych/commit/3de5aad43b538be56a3957be5beb6e9910b74267) Thanks [@jadeddelta](https://github.com/jadeddelta)! - update to force the dom to clear after each individual test

## 3.0.1

### Patch Changes

- [#3401](https://github.com/jspsych/jsPsych/pull/3401) [`db7bcf82`](https://github.com/jspsych/jsPsych/commit/db7bcf82f6491ac8d02c7c4cf89e42d4ddcde1d9) Thanks [@jadeddelta](https://github.com/jadeddelta)! - allow JSON resolution in contrib repository for usage of package.json in versioning

## 3.0.0

### Major Changes

- [#2858](https://github.com/jspsych/jsPsych/pull/2858) [`76e75080`](https://github.com/jspsych/jsPsych/commit/76e75080247e936c6ae8a8227517fb95ce74974b) Thanks [@bjoluc](https://github.com/bjoluc)! - Activate TypeScript's `isolatedModules` flag in the root `tsconfig.json` file. If you are facing any TypeScript errors due to `isolatedModules`, please update your code according to the error messages.

- [#2858](https://github.com/jspsych/jsPsych/pull/2858) [`810ed7a3`](https://github.com/jspsych/jsPsych/commit/810ed7a3d1d9181cf25a9cb11ddd37914cd97483) Thanks [@bjoluc](https://github.com/bjoluc)! - Migrate the build chain from TypeScript, Babel, and Terser to [esbuild](https://esbuild.github.io/). Babel and Terser are no longer included as dependencies and the Babel configuration at `@jspsych/config/babel` has been removed. The minified browser builds are only transpiled down to [ES2015](https://caniuse.com/es6) now.

## 2.0.2

### Patch Changes

- [#3293](https://github.com/jspsych/jsPsych/pull/3293) [`7bcd4e0a`](https://github.com/jspsych/jsPsych/commit/7bcd4e0a25b46e2cf384f6b747092e75fabce00f) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - This fixes an error in the gulp task that creates the dist archive for a release, which was causing the dist archive to fail.

## 2.0.1

### Patch Changes

- [#3287](https://github.com/jspsych/jsPsych/pull/3287) [`54e04dc9`](https://github.com/jspsych/jsPsych/commit/54e04dc93f54a7a019db1fee4961dcc5e02b6fc0) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Adds the survey.css file to the dist archive (#3131).

## 2.0.0

### Major Changes

- [#3122](https://github.com/jspsych/jsPsych/pull/3122) [`715a9d13`](https://github.com/jspsych/jsPsych/commit/715a9d130ec1d4772ce0b61956d8c19be5348fca) Thanks [@bjoluc](https://github.com/bjoluc)! - Upgrade build tools to their latest versions. This doesn't introduce breaking changes to the artifacts built using `@jspsych/config`, but it requires some minor changes to projects using `@jspsych/config`:

  - The minimum required Node.js version is now 18.0.0
  - Jest has been upgraded from v28 to v29 and ts-jest has been replaced with the more performant Sucrase Jest plugin to avoid significant memory leaks. As a consequence, Jest does no longer type-check code. If you are facing any issues, please check Jest's [upgrade guide](https://jestjs.io/docs/upgrading-to-jest29) for instructions on updating your tests.
  - TypeScript has been upgraded from version 4 to version 5. This is very unlikely to break anything in your code though.

### Patch Changes

- [#3122](https://github.com/jspsych/jsPsych/pull/3122) [`535e5d90`](https://github.com/jspsych/jsPsych/commit/535e5d903c4a5d6c71f3eecb73bc62b51e044a1f) Thanks [@bjoluc](https://github.com/bjoluc)! - Remove erroneous browser builds from the rollup configuration returned by `makeNodeRollupConfig()`

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 1.3.3

### Patch Changes

- [#3073](https://github.com/jspsych/jsPsych/pull/3073) [`caef8713`](https://github.com/jspsych/jsPsych/commit/caef8713e28fd0c4ed85ba86c27254ee8418087a) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Update `canvas` package dependency version to fix missing binaries issues with newer node/npm versions

## 1.3.2

### Patch Changes

- [`e3e9d903`](https://github.com/jspsych/jsPsych/commit/e3e9d903462663b694633cdf873accefda453961) Thanks [@bjoluc](https://github.com/bjoluc)! - Prevent rollup from relying on node internals in browser builds

## 1.3.1

### Patch Changes

- [#2643](https://github.com/jspsych/jsPsych/pull/2643) [`dc005661`](https://github.com/jspsych/jsPsych/commit/dc005661420dcc5c8aec62651687fc9aeac5fb65) Thanks [@bjoluc](https://github.com/bjoluc)! - Include previously undefined `regeneratorRuntime` in the Babel build of the `jspsych` package

## 1.3.0

### Minor Changes

- [`3463e977`](https://github.com/jspsych/jsPsych/commit/3463e9778f3c2787b9c75c0f9bd7d19cc79798b3) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Add the updatePluginVersions gulp task. This task looks at each of the docs/plugins markdown files, finds the page title and "Current version" string, adds the current version number (from the package.json file), and uses the package name as the page title.

### Patch Changes

- [#2631](https://github.com/jspsych/jsPsych/pull/2631) [`e77371e9`](https://github.com/jspsych/jsPsych/commit/e77371e94b3496361138d681c16840829f4c5cd2) Thanks [@bjoluc](https://github.com/bjoluc)! - Update dependencies, including Jest v27 to v28. The changelogs have been carefully checked and no breaking changes are to be expected in packages using `@jspsych/config`. Check out the [Jest 28 blog post](https://jestjs.io/blog/2022/04/25/jest-28) for a summary of the changes in Jest.

* [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Apply Babel Rollup plugin to `.ts` files in the `index.browser.min.js` build. It was erroneously ignoring transpiled `.ts` files before.

## 1.2.0

### Minor Changes

- [#2431](https://github.com/jspsych/jsPsych/pull/2431) [`87f332f9`](https://github.com/jspsych/jsPsych/commit/87f332f92540eef028bbed7284e30c1cf614cc96) Thanks [@bjoluc](https://github.com/bjoluc)! - Implement an `updateUnpkgLinks` Gulp task to update each unpkg link with a precise version number to the corresponding package's current version as defined in the package's `package.json`.

### Patch Changes

- [#2505](https://github.com/jspsych/jsPsych/pull/2505) [`9486bc50`](https://github.com/jspsych/jsPsych/commit/9486bc509f8fe4b4ac4b93510ddd8fd17e5f1b05) Thanks [@bjoluc](https://github.com/bjoluc)! - Fix css path rewriting in `createCoreDistArchive` Gulp task when `link` tags do not end in `/>`

## 1.1.0

### Minor Changes

- [#2357](https://github.com/jspsych/jsPsych/pull/2357) [`c44ac202`](https://github.com/jspsych/jsPsych/commit/c44ac2024ae51cf14efa60ca285bb2e4dc0ebef7) Thanks [@bjoluc](https://github.com/bjoluc)! - Add a VERSION.md file to the release archive created by the `createCoreDistArchive` Gulp task

## 1.0.0

### Major Changes

- [`bc058590`](https://github.com/jspsych/jsPsych/commit/bc058590950285e52116f809e4ccc57bae5a67f5) Thanks [@bjoluc](https://github.com/bjoluc)! - Initial release
