# jspsych

## 7.3.4

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 7.3.3

### Patch Changes

- [#3039](https://github.com/jspsych/jsPsych/pull/3039) [`465527a8`](https://github.com/jspsych/jsPsych/commit/465527a849847a1728c983a582a3b38d5e66de25) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fix error in how nested parameters were handled in simulation mode, #2911

* [#3039](https://github.com/jspsych/jsPsych/pull/3039) [`852d5745`](https://github.com/jspsych/jsPsych/commit/852d57451668aec2975b3f8a0313409bdf332bbb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed how simulation mode handles `setTimeout` calls to ensure that timeouts are cleared at the end of a trial, even in cases where the user interacts with a simulated trial when the simulation is being run in `visual` mode.

- [#3039](https://github.com/jspsych/jsPsych/pull/3039) [`612d9e12`](https://github.com/jspsych/jsPsych/commit/612d9e125f9002c1ba383a4fafe4123bdfef0f17) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed issue where a trial's `on_load` was not called when using simulation mode but setting a trial's `simulate` option to `false`.

* [#3039](https://github.com/jspsych/jsPsych/pull/3039) [`481efec0`](https://github.com/jspsych/jsPsych/commit/481efec07558fac786167a091dc2582c17cd0c5d) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fix target of simulation `dispatchEvent` so that simulation mode works with custom `display_element`

## 7.3.2

### Patch Changes

- [#2974](https://github.com/jspsych/jsPsych/pull/2974) [`13243618`](https://github.com/jspsych/jsPsych/commit/1324361835de41a176757c3d9d0038b740cb4c76) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - This fixes an issue when a plugin has a COMPLEX parameter and there is a default value specified at the root level of the parameter, rather than for each individual nested parameter (#2972).

## 7.3.1

### Patch Changes

- [#2754](https://github.com/jspsych/jsPsych/pull/2754) [`6bf9ea97`](https://github.com/jspsych/jsPsych/commit/6bf9ea973e7a0309dd1f5ea06043a27ea2f991bf) Thanks [@javidalpe](https://github.com/javidalpe)! - Fix preload plugin onerror callback so that it returns proper src information when there are 404 errors.

* [#2811](https://github.com/jspsych/jsPsych/pull/2811) [`28136787`](https://github.com/jspsych/jsPsych/commit/28136787ecdefc4c4620393576b5179b734454f1) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed a bug in `randomization.shuffleNoRepeats()` where having an `equalityFunction` that used a logical OR could result in some neighboring elements still evaluating to `true` via `equalityFunction`.

## 7.3.0

### Minor Changes

- [#2649](https://github.com/jspsych/jsPsych/pull/2649) [`a446f504`](https://github.com/jspsych/jsPsych/commit/a446f504ccf0180f44fbdf25fd1ba7e10bfdfe0f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Allow passing `blob:` URLs as input to video plugins.

* [#2664](https://github.com/jspsych/jsPsych/pull/2664) [`57f2ae4c`](https://github.com/jspsych/jsPsych/commit/57f2ae4c697d2434fe548e7f8b376f904b87086e) Thanks [@bjoluc](https://github.com/bjoluc)! - Add support for asynchronous extension `on_finish` methods

- [#2649](https://github.com/jspsych/jsPsych/pull/2649) [`133d85f4`](https://github.com/jspsych/jsPsych/commit/133d85f498f9bacbfb40b9abd8f135f99fbe947c) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add features for recording from video streams to the pluginAPI

### Patch Changes

- [#2683](https://github.com/jspsych/jsPsych/pull/2683) [`0d2808f6`](https://github.com/jspsych/jsPsych/commit/0d2808f648b4eb682c8fbbbbd0637f788f93a08b) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `jsPsych.timelineVariable()` will now produce a `console.warn()` when the timeline variable does not exist.

## 7.2.3

### Patch Changes

- [#2643](https://github.com/jspsych/jsPsych/pull/2643) [`dc005661`](https://github.com/jspsych/jsPsych/commit/dc005661420dcc5c8aec62651687fc9aeac5fb65) Thanks [@bjoluc](https://github.com/bjoluc)! - Include previously undefined `regeneratorRuntime` in the Babel build of the `jspsych` package

## 7.2.2

### Patch Changes

- [#2628](https://github.com/jspsych/jsPsych/pull/2628) [`661a64f8`](https://github.com/jspsych/jsPsych/commit/661a64f8b0a27881f40dac0a28c2db00fe055125) Thanks [@vijaymarupudi](https://github.com/vijaymarupudi)! - Use a more efficient method to access the most recent trial's data at the end of each trial.

* [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Improve browser compatibility when loading via `unpkg.com`, i.e. when using the `dist/index.browser.min.js` build artifact.

## 7.2.1

### Patch Changes

- [#2540](https://github.com/jspsych/jsPsych/pull/2540) [`48b83652`](https://github.com/jspsych/jsPsych/commit/48b8365294cf76a0dcc91225da4405c583f3349f) Thanks [@bjoluc](https://github.com/bjoluc)! - Fix a ReferenceError ("`require$0` is not defined") related to the new seedable random number generator

## 7.2.0

### Minor Changes

- [#2407](https://github.com/jspsych/jsPsych/pull/2407) [`cafc6a1f`](https://github.com/jspsych/jsPsych/commit/cafc6a1f65f3f6b9f09598e3b12dfa2ad76d9451) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added `filterColumns()` to the DataCollection class. This function lets users select a subset of the columns in the DataCollection. It is the opposite of the `ignore()` method.

* [#2379](https://github.com/jspsych/jsPsych/pull/2379) [`9a28fb08`](https://github.com/jspsych/jsPsych/commit/9a28fb08dbe0953b9a8eea2d1da988152f370e66) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added `setSeed()` to `jsPsych.randomization` to allow for seeding the random number generator and generating predictable sequences of random numbers.

### Patch Changes

- [#2539](https://github.com/jspsych/jsPsych/pull/2539) [`49d69075`](https://github.com/jspsych/jsPsych/commit/49d6907505cdfcd4aa997c7501a8dbd704646162) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed an issue where the `post_trial_gap` was still run in realtime during `data-only` simulation mode. The gap is now skipped as intended.

* [#2504](https://github.com/jspsych/jsPsych/pull/2504) [`60f4d868`](https://github.com/jspsych/jsPsych/commit/60f4d868352d78593beba39c8b2bf0e88b264df8) Thanks [@bjoluc](https://github.com/bjoluc)! - Inline Open Sans web font in `jspsych.css` to be GDPR-compliant (see #2153)

## 7.1.2

### Patch Changes

- [#2380](https://github.com/jspsych/jsPsych/pull/2380) [`5159e0eb`](https://github.com/jspsych/jsPsych/commit/5159e0eb23ecf2a131bf91edbd13a4b04bf0283b) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed the case where `simulation_options` is a function that returns a string for looking up corresponding options in the simulate settings.

## 7.1.1

### Patch Changes

- [#2376](https://github.com/jspsych/jsPsych/pull/2376) [`01f8a373`](https://github.com/jspsych/jsPsych/commit/01f8a373799baf871b0f91b64e81cb108323bacd) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Fixed the default case for `jsPsych.simulate()` when no simulation_mode is specified. Now properly runs in data-only mode.

## 7.1.0

### Minor Changes

- [#2350](https://github.com/jspsych/jsPsych/pull/2350) [`c81b5007`](https://github.com/jspsych/jsPsych/commit/c81b500771ce449ac8145925170a63a08ab0465e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added microphone related features to the `pluginAPI` module: `initializeMicrophoneRecorder()` and `getMicrophoneRecorder()`. These allow sharing of the `MediaRecorder` object attached to the microphone's `MediaStream` across trials.

* [#2245](https://github.com/jspsych/jsPsych/pull/2245) [`1216ace2`](https://github.com/jspsych/jsPsych/commit/1216ace2a3cf15538dab5d522c46880e31c5be89) Thanks [@bjoluc](https://github.com/bjoluc)! - Throw errors if trial `type` parameters are strings, deprecated jsPsych functions are called, or the global `jsPsych` variable is used without assigning a JsPsych instance first (#2217)

- [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added `randomInt(lower, upper)`, `sampleBernoulli(p)`, `sampleNormal(mean, std)`, `sampleExponential(rate)`, and `sampleExGaussian(mean, std, rate, positive=false)` to `jsPsych.randomization`.

* [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added the ability to run the experiment in simulation mode using `jsPsych.simulate()`. See the [simulation mode](https://www.jspsych.org/latest/overview/simulation) documentation for information about how to get started.

- [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added methods to assist with simulation (e.g., `pressKey` for dispatching a keyboard event and `clickTarget` for dispatching a click event) to the PluginAPI module.

* [#2209](https://github.com/jspsych/jsPsych/pull/2209) [`45fb3ebb`](https://github.com/jspsych/jsPsych/commit/45fb3ebb92a7effaf807c548ccd01eb2cda39110) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `jsPsych.endExperiment()` has a new, optional second parameter for saving data. Passing in an object of key-value pairs will store the pairs in the data for the final trial of the experiment.

- [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added several functions to the `pluginAPI` module in order to support the new simulation feature.

### Patch Changes

- [#2287](https://github.com/jspsych/jsPsych/pull/2287) [`522aa2cd`](https://github.com/jspsych/jsPsych/commit/522aa2cdbf64886e95b2b50f5442cc360b631339) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - The weights argument for `randomization.sampleWithReplacement()` is now explicitly marked as optional in TypeScript. This has no impact on usage, as the implementation was already treating this argument as optional.

## 7.0.0

### Major Changes

- [#2183](https://github.com/jspsych/jsPsych/pull/2183) [`c8760b1`](https://github.com/jspsych/jsPsych/commit/c8760b19483453b0e77dc98e464e1629b5605a15) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**

  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/7.0/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/7.0/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.

* [#2130](https://github.com/jspsych/jsPsych/pull/2130) [`2802430`](https://github.com/jspsych/jsPsych/commit/28024309995fe0102b53d4dde2b98393da9ff91f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added the option for plugins to return a `Promise` and delay the execution of the `on_load` event handler for the trial until the plugin manually invokes it. This allows for plugins that have asynchronous components to finish loading before triggering the `on_load` event. Added this functionality to all plugins that currently require it.

- [#2100](https://github.com/jspsych/jsPsych/pull/2100) [`b0d77e7`](https://github.com/jspsych/jsPsych/commit/b0d77e79aaa7140de4bac37a70af69467478aee2) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Renamed all getter-type functions to have `get` prefix to make it clearer what the role of these functions are. The following were affected:
  - `currentTimelineNodeID` -> `getCurrentTimelineNodeID`
  - `progress` -> `getProgress`
  - `startTime` -> `getStartTime`
  - `totalTime` -> `getTotalTime`
  - `currentTrial` -> `getCurrentTrial`
  - `initSettings` -> `getInitSettings`
  - `allTimelineVariables` -> `getAllTimelineVariables`

### Minor Changes

- [#2142](https://github.com/jspsych/jsPsych/pull/2142) [`12d6753`](https://github.com/jspsych/jsPsych/commit/12d675320f9e2a3edaff52167320ed39461c5d79) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - When `jsPsych.endExperiment` is called it provides the option of displaying a message on the screen. If the `on_finish` event handler in `initJsPsych()` returns a `Promise` then the message will now display only after the promise has resolved.

* [#2129](https://github.com/jspsych/jsPsych/pull/2129) [`f37f64a`](https://github.com/jspsych/jsPsych/commit/f37f64ac61ca4d934bf19a4dd15c9370ac4c2a8e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - All duration measurements, including response times, are now rounded to the nearest millisecond. We changed this because the precision that `performance.now()` generates is misleading in this context and removing the (often very long) decimal component of the measurement will save space in the data files.

- [#2121](https://github.com/jspsych/jsPsych/pull/2121) [`03517a0`](https://github.com/jspsych/jsPsych/commit/03517a09c826d935114649174f4f1dc239bf36ea) Thanks [@zimmerrol](https://github.com/zimmerrol)! - Updated `turk.submitToTurk()` to use `POST` instead of `GET` to avoid errors where too much data is transmitted.
