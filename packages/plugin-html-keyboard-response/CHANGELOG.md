# @jspsych/plugin-html-keyboard-response

## 2.2.0

### Minor Changes

- [#3707](https://github.com/jspsych/jsPsych/pull/3707) [`a9f454ee58fda69173dbaa1ecfa4aa7797920031`](https://github.com/jspsych/jsPsych/commit/a9f454ee58fda69173dbaa1ecfa4aa7797920031) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added the ability to measure how long a response key was held down. The `getKeyboardResponse()` method of the keyboard plugin API gains an optional `wait_for_key_release` option; when true, the `callback_function` fires at key release instead of key press, and its payload includes an `rt_key_duration` field (the press-to-release duration in milliseconds) alongside the usual `key` and `rt`. The five `*-keyboard-response` plugins (html, image, audio, video, canvas) expose a matching `wait_for_key_release` trial parameter (default false) and record the new `rt_key_duration` data field. The release is matched to the press by the physical key (`KeyboardEvent.code`), so changing the shift state while holding a key (which changes `e.key`) does not prevent the release from being detected, and the `key` reported to the callback is always the value from the original keydown event. If the window loses focus while a key is held (a `blur` event), the browser stops delivering the eventual `keyup`; in that case the pending release is resolved with `rt_key_duration: null` (the hold duration cannot be measured) and the held-key state is cleared so it does not leak into the next trial.

## 2.1.0

### Minor Changes

- [#3385](https://github.com/jspsych/jsPsych/pull/3385) [`3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc`](https://github.com/jspsych/jsPsych/commit/3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc) Thanks [@cherriechang](https://github.com/cherriechang)! - Added citations property to info field of all plugins/extensions in two citation formats (apa, bibtex); added getCitations() as function in jsPsych package allowing user to generate citations by passing an array of plugins/extensions by name as first input and citation format as string as second input; changed template of plugins/extensions to contain citations field by default; citations for each plugin/extension are automatically generated from .cff file (if any) at its folder's root during build process; getCitations() prints out citations in the form of a string separating each citation with newline character, and always prints the jsPsych library citation first.

## 2.0.0

### Major Changes

- [#3339](https://github.com/jspsych/jsPsych/pull/3339) [`74b4adc7`](https://github.com/jspsych/jsPsych/commit/74b4adc702747a62a201575a6aa95770eeddb1bb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `finishTrial()` now clears the display and any timeouts set with `pluginApi.setTimeout()`

### Minor Changes

- [#3326](https://github.com/jspsych/jsPsych/pull/3326) [`c5a0dbb1`](https://github.com/jspsych/jsPsych/commit/c5a0dbb17ead8e2b860c76fce7fea834f3b0ad09) Thanks [@vzhang03](https://github.com/vzhang03)! - Updated all plugins to implement new pluginInfo standard that contains version, data generated and new documentation style to match migration of docs to be integrated with the code and packages themselves"

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

## 1.0.0

### Major Changes

- [#2183](https://github.com/jspsych/jsPsych/pull/2183) [`c8760b1`](https://github.com/jspsych/jsPsych/commit/c8760b19483453b0e77dc98e464e1629b5605a15) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**

  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/7.0/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/7.0/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.

### Patch Changes

- Updated dependencies [[`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2), [`37b85f95`](https://github.com/jspsych/jsPsych/commit/37b85f953c803e1cca80d8e5275be948d375e2f2)]:
  - jspsych@7.0.0
