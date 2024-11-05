# @jspsych/plugin-sketchpad

## 2.0.1

### Patch Changes

- [#3368](https://github.com/jspsych/jsPsych/pull/3368) [`4b080ca4`](https://github.com/jspsych/jsPsych/commit/4b080ca4c5060fa085da31d101606f60f6cd5448) Thanks [@Max-Lovell](https://github.com/Max-Lovell)! - Fixed broken event handlers in the sketchpad plugin.

## 2.0.0

### Major Changes

- [#3339](https://github.com/jspsych/jsPsych/pull/3339) [`74b4adc7`](https://github.com/jspsych/jsPsych/commit/74b4adc702747a62a201575a6aa95770eeddb1bb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `finishTrial()` now clears the display and any timeouts set with `pluginApi.setTimeout()`

### Minor Changes

- [#3326](https://github.com/jspsych/jsPsych/pull/3326) [`c5a0dbb1`](https://github.com/jspsych/jsPsych/commit/c5a0dbb17ead8e2b860c76fce7fea834f3b0ad09) Thanks [@vzhang03](https://github.com/vzhang03)! - Updated all plugins to implement new pluginInfo standard that contains version, data generated and new documentation style to match migration of docs to be integrated with the code and packages themselves"

## 1.0.4

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 1.0.3

### Patch Changes

- [#2781](https://github.com/jspsych/jsPsych/pull/2781) [`12956b3c`](https://github.com/jspsych/jsPsych/commit/12956b3cc130676a81e4a4536d68800a4d34e8a8) Thanks [@jadeddelta](https://github.com/jadeddelta)! - added readme for visibility on npmjs.com

## 1.0.2

### Patch Changes

- [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Improve browser compatibility when loading via `unpkg.com`, i.e. when using the `dist/index.browser.min.js` build artifact.

## 1.0.1

### Patch Changes

- [#2401](https://github.com/jspsych/jsPsych/pull/2401) [`76ec31f2`](https://github.com/jspsych/jsPsych/commit/76ec31f2242216f871472d5e26d9c0644cea0477) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed several bugs in the sketchpad plugin. See #2399 for list.

## 1.0.0

### Major Changes

- [#2258](https://github.com/jspsych/jsPsych/pull/2258) [`bddae3ee`](https://github.com/jspsych/jsPsych/commit/bddae3eef7abb4dae1eef813a81584e3c4042b0f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - A plugin for drawing responses on a canvas element. Supports very basic drawing operations and recording both the final image and the sequential steps to generate that image.
