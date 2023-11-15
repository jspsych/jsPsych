# @jspsych/plugin-initialize-microphone

## 1.0.3

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 1.0.2

### Patch Changes

- [#2781](https://github.com/jspsych/jsPsych/pull/2781) [`12956b3c`](https://github.com/jspsych/jsPsych/commit/12956b3cc130676a81e4a4536d68800a4d34e8a8) Thanks [@jadeddelta](https://github.com/jadeddelta)! - added readme for visibility on npmjs.com

## 1.0.1

### Patch Changes

- [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Improve browser compatibility when loading via `unpkg.com`, i.e. when using the `dist/index.browser.min.js` build artifact.

## 1.0.0

### Major Changes

- [#2350](https://github.com/jspsych/jsPsych/pull/2350) [`c81b5007`](https://github.com/jspsych/jsPsych/commit/c81b500771ce449ac8145925170a63a08ab0465e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of the `initialize-microphone` plugin. This plugin handles getting permission to use the microphone and selecting which microphone to use. See [the plugin's documentation](https://www.jspsych.org/latest/plugins/initialize-microphone) for details.
