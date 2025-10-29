# @jspsych/plugin-video-button-response

## 2.1.1

### Patch Changes

- [#3556](https://github.com/jspsych/jsPsych/pull/3556) [`d13767cac84cb7e6931a12db22e7edeb8ba1132f`](https://github.com/jspsych/jsPsych/commit/d13767cac84cb7e6931a12db22e7edeb8ba1132f) Thanks [@jadeddelta](https://github.com/jadeddelta)! - `width` and `height` default parameters are set to `null` as opposed to an empty string to properly reflect their types

## 2.1.0

### Minor Changes

- [#3385](https://github.com/jspsych/jsPsych/pull/3385) [`3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc`](https://github.com/jspsych/jsPsych/commit/3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc) Thanks [@cherriechang](https://github.com/cherriechang)! - Added citations property to info field of all plugins/extensions in two citation formats (apa, bibtex); added getCitations() as function in jsPsych package allowing user to generate citations by passing an array of plugins/extensions by name as first input and citation format as string as second input; changed template of plugins/extensions to contain citations field by default; citations for each plugin/extension are automatically generated from .cff file (if any) at its folder's root during build process; getCitations() prints out citations in the form of a string separating each citation with newline character, and always prints the jsPsych library citation first.

## 2.0.0

### Major Changes

- [#2858](https://github.com/jspsych/jsPsych/pull/2858) [`f90c0ef9`](https://github.com/jspsych/jsPsych/commit/f90c0ef95b09a0d87d663537f72eb9f46129641b) Thanks [@bjoluc](https://github.com/bjoluc)! - - Make `button_html` a function parameter which, given a choice's text and its index, returns the HTML string of the choice's button. If you were previously passing a string to `button_html`, like `<button>%choice%</button>`, you can now pass the function

  ```js
  function (choice) {
    return '<button class="jspsych-btn">' + choice + "</button>";
  }
  ```

  Similarly, if you were using the array syntax, like

  ```js
  ['<button class="a">%choice%</button>', '<button class="b">%choice%</button>', '<button class="a">%choice%</button>']
  ```

  an easy way to migrate your trial definition is to pass a function which accesses your array and replaces the `%choice%` placeholder:

  ```js
  function (choice, choice_index) {
    return ['<button class="a">%choice%</button>', '<button class="b">%choice%</button>', '<button class="a">%choice%</button>'][choice_index].replace("%choice%", choice);
  }
  ```

  From there on, you can further simplify your function. For instance, if the intention of the above example is to have alternating button classes, the `button_html` function might be rewritten as

  ```js
  function (choice, choice_index) {
    return '<button class="' + (choice_index % 2 === 0 ? "a" : "b") + '">' + choice + "</button>";
  }
  ```

  - Simplify the button DOM structure and styling: Buttons are no longer wrapped in individual container `div`s for spacing and `data-choice` attributes. Instead, each button is assigned its `data-choice` attribute and all buttons are direct children of the button group container `div`. The container `div`, in turn, utilizes a flexbox layout to position the buttons.

- [#3339](https://github.com/jspsych/jsPsych/pull/3339) [`74b4adc7`](https://github.com/jspsych/jsPsych/commit/74b4adc702747a62a201575a6aa95770eeddb1bb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `finishTrial()` now clears the display and any timeouts set with `pluginApi.setTimeout()`

### Minor Changes

- [#3326](https://github.com/jspsych/jsPsych/pull/3326) [`c5a0dbb1`](https://github.com/jspsych/jsPsych/commit/c5a0dbb17ead8e2b860c76fce7fea834f3b0ad09) Thanks [@vzhang03](https://github.com/vzhang03)! - Updated all plugins to implement new pluginInfo standard that contains version, data generated and new documentation style to match migration of docs to be integrated with the code and packages themselves"

## 1.2.0

### Minor Changes

- [#3298](https://github.com/jspsych/jsPsych/pull/3298) [`a4088529`](https://github.com/jspsych/jsPsych/commit/a4088529cf65c0fc37a3a6ad4870cd69f96383ad) Thanks [@thtTNT](https://github.com/thtTNT)! - Issue (#3289), Add parameter "enable_button_after" to all "-button-response" plugins

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

### Minor Changes

- [#2129](https://github.com/jspsych/jsPsych/pull/2129) [`f37f64a`](https://github.com/jspsych/jsPsych/commit/f37f64ac61ca4d934bf19a4dd15c9370ac4c2a8e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - All duration measurements, including response times, are now rounded to the nearest millisecond. We changed this because the precision that `performance.now()` generates is misleading in this context and removing the (often very long) decimal component of the measurement will save space in the data files.

### Patch Changes

- [#1533](https://github.com/jspsych/jsPsych/pull/1533) [`7b16a1d`](https://github.com/jspsych/jsPsych/commit/7b16a1d) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Fixed a bug that caused the trial to not end when the `trial_ends_after_video` parameter was set to `true` and the video ended at a specific time via the `stop` parameter.

* [#2192](https://github.com/jspsych/jsPsych/pull/2192) [`2883e421`](https://github.com/jspsych/jsPsych/commit/2883e4211dbf8c6bb5cf291289ff2e3f82252032) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Fix implementation of `start` parameter in `video-*` plugins so that it works in iOS/MacOS browsers.

* Updated dependencies [[`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2)]:
  - jspsych@7.0.0
