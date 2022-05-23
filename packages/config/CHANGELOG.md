# @jspsych/config

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
