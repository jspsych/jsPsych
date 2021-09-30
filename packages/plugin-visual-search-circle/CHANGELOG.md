# @jspsych/plugin-visual-search-circle

## 1.0.0
### Major Changes



- [#2183](https://github.com/jspsych/jsPsych/pull/2183) Thanks [@jodeleeuw](https://github.com/jodeleeuw), [@becky-gilbert](https://github.com/becky-gilbert), [@bjoluc](https://github.com/bjoluc)! - **jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions.**
  
  To support this change, we've made a number of breaking changes. We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways. In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.


- [#2133](https://github.com/jspsych/jsPsych/pull/2133) [`2acc888`](https://github.com/jspsych/jsPsych/commit/2acc8880c51e60ee9d8694a0d1a1a62f55a53655) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - Added new `stimuli` parameter and changed `foil` parameter to only allow a string (not array). The visual circle stimuli set can now be defined in two ways. One option is to use the `set_size`, `target` (image string), and `foil` (image string) parameters, in which case the `foil` image will be repeated up to `set_size` (if target is not present) or `set_size` - 1 (if target is present). The other option is to specify the `stimuli` parameter, which is an arbitrary array of images and therefore allows for different foil/distractor images.


### Patch Changes

- Updated dependencies [[`918a50b1`](https://github.com/jspsych/jsPsych/commit/918a50b17d9e125b5fd2ec8e17aee7a307bd68f7), [`2096ea8c`](https://github.com/jspsych/jsPsych/commit/2096ea8c3e8b3d25f001d431eca63647358cc776), [`6b5d411e`](https://github.com/jspsych/jsPsych/commit/6b5d411e9c220d67f800238310df40accbee0c6c), [`cab29416`](https://github.com/jspsych/jsPsych/commit/cab2941619fb0c7798f222f90c224ee5383c3582), [`f7028a3d`](https://github.com/jspsych/jsPsych/commit/f7028a3d64668a657cee04df3994c9f197f1658d), [`14e62a77`](https://github.com/jspsych/jsPsych/commit/14e62a77cbcd528d6ffe6f695118c52b60972939)]:
  - jspsych@7.0.0
