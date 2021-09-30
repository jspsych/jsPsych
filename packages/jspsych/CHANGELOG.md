# jspsych

## 7.0.0
### Major Changes



- [#2183](https://github.com/jspsych/jsPsych/pull/2183) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**
  
  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.


- [#2130](https://github.com/jspsych/jsPsych/pull/2130) [`2802430`](https://github.com/jspsych/jsPsych/commit/28024309995fe0102b53d4dde2b98393da9ff91f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added the option for plugins to return a `Promise` and delay the execution of the `on_load` event handler for the trial until the plugin manually invokes it. This allows for plugins that have asynchronous components to finish loading before triggering the `on_load` event. Added this functionality to all plugins that currently require it.



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



- [#2129](https://github.com/jspsych/jsPsych/pull/2129) [`f37f64a`](https://github.com/jspsych/jsPsych/commit/f37f64ac61ca4d934bf19a4dd15c9370ac4c2a8e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - All duration measurements, including response times, are now rounded to the nearest millisecond. We changed this because the precision that `performance.now()` generates is misleading in this context and removing the (often very long) decimal component of the measurement will save space in the data files.



- [#2121](https://github.com/jspsych/jsPsych/pull/2121) [`03517a0`](https://github.com/jspsych/jsPsych/commit/03517a09c826d935114649174f4f1dc239bf36ea) Thanks [@zimmerrol](https://github.com/zimmerrol)! - Updated `turk.submitToTurk()` to use `POST` instead of `GET` to avoid errors where too much data is transmitted.
