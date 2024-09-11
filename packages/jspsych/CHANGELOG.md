# jspsych

## 8.0.2

### Patch Changes

- [#3368](https://github.com/jspsych/jsPsych/pull/3368) [`115a3b3d`](https://github.com/jspsych/jsPsych/commit/115a3b3d539b44df91503c58f2eba72c98679c29) Thanks [@Max-Lovell](https://github.com/Max-Lovell)! - Remove uses of Array.from() to improve Qualtrics compatibility

## 8.0.1

### Patch Changes

- [#3352](https://github.com/jspsych/jsPsych/pull/3352) [`07835730`](https://github.com/jspsych/jsPsych/commit/078357306c20736a71bda3cf6e7755466a372edc) Thanks [@Bankminer78](https://github.com/Bankminer78)! - ExtensionManager correctly uses extension instantiation data to produce version and type, and warns users if fields are missing.

## 8.0.0

### Major Changes

- [#2858](https://github.com/jspsych/jsPsych/pull/2858) [`b8001735`](https://github.com/jspsych/jsPsych/commit/b80017351cdc9d138d55dd870b3f94e9de03016d) Thanks [@bjoluc](https://github.com/bjoluc)! - Rewrite jsPsych's core logic. The following breaking changes have been made:

  **Timeline Events**

  - `conditional_function` is no longer executed on every iteration of a looping timeline, but only once before running the first trial of the timeline. If you rely on the old behavior, move your `conditional_function` into a nested timeline instead.
  - `on_timeline_start` and `on_timeline_finish` are no longer invoked in every repetition of a timeline, but only at the beginning or at the end of the timeline, respectively. If you rely on the old behavior, move the `on_timeline_start` and `on_timeline_finish` callbacks into a nested timeline.

  **Timeline Variables**

  - The functionality of `jsPsych.timelineVariable()` has been explicitly split into two functions, `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`. Use `jsPsych.timelineVariable()` to create a timeline variable placeholder and `jsPsych.evaluateTimelineVariable()` to retrieve a given timeline variable's current value.
  - `jsPsych.evaluateTimelineVariable()` now throws an error if a variable is not found.
  - `jsPsych.getAllTimelineVariables()` has been replaced by a trial-level `save_timeline_variables` parameter that can be used to include all or some timeline variables in a trial's result data.

  **Parameter Handling**

  - JsPsych will now throw an error when a non-array value is used for a trial parameter marked as `array: true` in the plugin's info object.
  - Parameter functions and timeline variables are no longer automatically evaluated recursively throughout the whole trial object, but only for the parameters that a plugin specifies in its `info` object. Parameter functions and timeline variables in nested objects are only evaluated if the nested object's parameters are explicitly specified using the `nested` property in the parameter description.

  **Progress Bar**

  - `jsPsych.setProgressBar(x)` has been replaced by `jsPsych.progressBar.progress = x`
  - `jsPsych.getProgressBarCompleted()` has been replaced by `jsPsych.progressBar.progress`
  - The automatic progress bar updates after every trial now, including trials in nested timelines.

  **Data Handling**

  - Timeline nodes no longer have IDs. As a consequence, the `internal_node_id` trial result property and `jsPsych.data.getDataByTimelineNode()` have been removed.
  - Unlike previously, the `save_trial_parameters` parameter can only be used to remove parameters that are specified in the plugin's info object. Other result properties will be left untouched.

  **Miscellaneous Changes**

  - `jsPsych.endExperiment()` and `jsPsych.endCurrentTimeline()` have been renamed to `jsPsych.abortExperiment()` and `jsPsych.abortCurrentTimeline()`, respectively.
  - JsPsych now internally relies on the JavaScript event loop. This means automated tests have to `await` utility functions like `pressKey()` to process the event loop.
  - The `jspsych` package no longer exports `universalPluginParameters` and the `UniversalPluginParameters` type.
  - Interaction listeners are now removed when the experiment ends.

- [#3166](https://github.com/jspsych/jsPsych/pull/3166) [`ce4333cc`](https://github.com/jspsych/jsPsych/commit/ce4333cc799e4489ed145baf84d7d6c522a61e08) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Removed the `exclusions` option from `initJsPsych()`. The recommended replacement for this functionality is the browser-check plugin.

  Removed the `hardwareAPI` module from the pluginAPI. This was no longer being updated and the features were out of date.

- [#3031](https://github.com/jspsych/jsPsych/pull/3031) [`f9eb17c3`](https://github.com/jspsych/jsPsych/commit/f9eb17c376d07003a30cd1aca42ca55e8d2b7488) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Changed the behavior of `DataColumn.mean()` to exclude `null` and `undefined` values from the calculation, as suggested in #2905

- [#3342](https://github.com/jspsych/jsPsych/pull/3342) [`6717e00c`](https://github.com/jspsych/jsPsych/commit/6717e00c97f602a987a7511afa3182a74d43b5fb) Thanks [@Bankminer78](https://github.com/Bankminer78)! - Changed plugins to use AudioPlayer class; added tests using AudioPlayer mock; plugins now use AudioPlayerInterface.

- [#3162](https://github.com/jspsych/jsPsych/pull/3162) [`3f359e55`](https://github.com/jspsych/jsPsych/commit/3f359e554baccd2d9e7f80d4fc5c174928611c7d) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Removed `max-width: 95%` CSS rule on the `.jspsych-content` `<div>`. This rule existed to address an old IE bug with flex layouts.

- [#3339](https://github.com/jspsych/jsPsych/pull/3339) [`74b4adc7`](https://github.com/jspsych/jsPsych/commit/74b4adc702747a62a201575a6aa95770eeddb1bb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `finishTrial()` now clears the display and any timeouts set with `pluginApi.setTimeout()`

### Minor Changes

- [#3168](https://github.com/jspsych/jsPsych/pull/3168) [`7b1ae24f`](https://github.com/jspsych/jsPsych/commit/7b1ae24f4e726350e1aa4e7c6f842e4d4240c956) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added `jsPsych.abortTimelineByName()`. This allows for aborting a specific active timeline by its `name` property. The `name` can be set in the description of the timline.

- [#3326](https://github.com/jspsych/jsPsych/pull/3326) [`c5a0dbb1`](https://github.com/jspsych/jsPsych/commit/c5a0dbb17ead8e2b860c76fce7fea834f3b0ad09) Thanks [@vzhang03](https://github.com/vzhang03)! - Updated all plugins to implement new pluginInfo standard that contains version, data generated and new documentation style to match migration of docs to be integrated with the code and packages themselves"

- [#3167](https://github.com/jspsych/jsPsych/pull/3167) [`6f9d01b2`](https://github.com/jspsych/jsPsych/commit/6f9d01b2ae0a35f38fadf78d8311cf501121681e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added `record_data` as a parameter available for any trial. Setting `record_data: false` will prevent data from being stored in the jsPsych data object for that trial.

- [#3182](https://github.com/jspsych/jsPsych/pull/3182) [`3855b5d8`](https://github.com/jspsych/jsPsych/commit/3855b5d86def9b155ae1f478cce93e4e1fd09d62) Thanks [@bjoluc](https://github.com/bjoluc)! - Allow trial `on_finish` methods to be asynchronous, i.e. return a `Promise`. Prior to this, promises returned by `on_finish` were not awaited before proceeding with the next trial.

- [#3201](https://github.com/jspsych/jsPsych/pull/3201) [`be7df303`](https://github.com/jspsych/jsPsych/commit/be7df30379c66a6786443cff2e503acbdc239901) Thanks [@Shaobin-Jiang](https://github.com/Shaobin-Jiang)! - Allow message_progress_bar to be a function

### Patch Changes

- [#3338](https://github.com/jspsych/jsPsych/pull/3338) [`7a4a4b83`](https://github.com/jspsych/jsPsych/commit/7a4a4b834e72109c31939347f53fa52026045c32) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `getKeyboardResponse` now returns the `key` in the original case (e.g., "Enter" instead of "enter") for easier matching to standard key event documentation.

- [#3152](https://github.com/jspsych/jsPsych/pull/3152) [`2852cda6`](https://github.com/jspsych/jsPsych/commit/2852cda642c6b1cfc0427049dfc6dfb321d9e27f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Button plugins now support either `display: grid` or `display: flex` on the container element that hold the buttons. If the layout is `grid`, the number of rows and/or columns can be specified. The `margin_horizontal` and `margin_vertical` parameters have been removed from the button plugins. If you need control over the button CSS, you can add inline style to the button element using the `button_html` parameter.

  jspsych.css has new layout classes to support this feature.

- [#3242](https://github.com/jspsych/jsPsych/pull/3242) [`6aea52c3`](https://github.com/jspsych/jsPsych/commit/6aea52c3e211db82afae9b06bd0a345a19963216) Thanks [@Shaobin-Jiang](https://github.com/Shaobin-Jiang)! - Fix typo in randomInt error message

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
