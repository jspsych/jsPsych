# @jspsych/config

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
