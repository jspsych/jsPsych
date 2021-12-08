# jspsych

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
