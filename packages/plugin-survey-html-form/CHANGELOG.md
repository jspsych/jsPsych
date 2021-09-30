# @jspsych/plugin-survey-html-form

## 1.0.0
### Major Changes



- [#2183](https://github.com/jspsych/jsPsych/pull/2183) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**
  
  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.

### Minor Changes



- [#2129](https://github.com/jspsych/jsPsych/pull/2129) [`f37f64a`](https://github.com/jspsych/jsPsych/commit/f37f64ac61ca4d934bf19a4dd15c9370ac4c2a8e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - All duration measurements, including response times, are now rounded to the nearest millisecond. We changed this because the precision that `performance.now()` generates is misleading in this context and removing the (often very long) decimal component of the measurement will save space in the data files.


### Patch Changes

- Updated dependencies [[`918a50b1`](https://github.com/jspsych/jsPsych/commit/918a50b17d9e125b5fd2ec8e17aee7a307bd68f7), [`2096ea8c`](https://github.com/jspsych/jsPsych/commit/2096ea8c3e8b3d25f001d431eca63647358cc776), [`6b5d411e`](https://github.com/jspsych/jsPsych/commit/6b5d411e9c220d67f800238310df40accbee0c6c), [`cab29416`](https://github.com/jspsych/jsPsych/commit/cab2941619fb0c7798f222f90c224ee5383c3582), [`f7028a3d`](https://github.com/jspsych/jsPsych/commit/f7028a3d64668a657cee04df3994c9f197f1658d), [`14e62a77`](https://github.com/jspsych/jsPsych/commit/14e62a77cbcd528d6ffe6f695118c52b60972939)]:
  - jspsych@7.0.0
