# @jspsych/plugin-video-keyboard-response

## 1.1.3

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 1.1.2

### Patch Changes

- [#2781](https://github.com/jspsych/jsPsych/pull/2781) [`12956b3c`](https://github.com/jspsych/jsPsych/commit/12956b3cc130676a81e4a4536d68800a4d34e8a8) Thanks [@jadeddelta](https://github.com/jadeddelta)! - added readme for visibility on npmjs.com

## 1.1.1

### Patch Changes

- [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Improve browser compatibility when loading via `unpkg.com`, i.e. when using the `dist/index.browser.min.js` build artifact.

## 1.1.0

### Minor Changes

- [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added support for `data-only` and `visual` simulation modes.

### Patch Changes

- [#2359](https://github.com/jspsych/jsPsych/pull/2359) [`a8ab2eb8`](https://github.com/jspsych/jsPsych/commit/a8ab2eb8f8be7c22261960e460d9b6bf79e48465) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixes the `response_allowed_while_playing` parameter to use the `stop` time of the video as the event that enables a response.

* [#2359](https://github.com/jspsych/jsPsych/pull/2359) [`d2a8b4ab`](https://github.com/jspsych/jsPsych/commit/d2a8b4ab4279ef16c29db3ef453ae9b688d6c29e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Throw an error when the `stimulus` parameter is not an array, see #1537 and #1530.

## 1.0.0

### Major Changes

- [#2183](https://github.com/jspsych/jsPsych/pull/2183) [`c8760b1`](https://github.com/jspsych/jsPsych/commit/c8760b19483453b0e77dc98e464e1629b5605a15) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**

  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/7.0/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/7.0/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.

### Patch Changes

- [#1533](https://github.com/jspsych/jsPsych/pull/1533) [`7b16a1d`](https://github.com/jspsych/jsPsych/commit/7b16a1d) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Fixed a bug that caused the trial to not end when the `trial_ends_after_video` parameter was set to `true` and the video ended at a specific time via the `stop` parameter.

* [#2192](https://github.com/jspsych/jsPsych/pull/2192) [`2883e421`](https://github.com/jspsych/jsPsych/commit/2883e4211dbf8c6bb5cf291289ff2e3f82252032) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Fix implementation of `start` parameter in `video-*` plugins so that it works in iOS/MacOS browsers.

* Updated dependencies [[`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2)]:
  - jspsych@7.0.0
