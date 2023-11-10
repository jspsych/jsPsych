# @jspsych/plugin-survey

## 0.2.2

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 0.2.1

### Patch Changes

- [#2781](https://github.com/jspsych/jsPsych/pull/2781) [`12956b3c`](https://github.com/jspsych/jsPsych/commit/12956b3cc130676a81e4a4536d68800a4d34e8a8) Thanks [@jadeddelta](https://github.com/jadeddelta)! - added readme for visibility on npmjs.com

## 0.2.0

### Minor Changes

- [#2622](https://github.com/jspsych/jsPsych/pull/2622) [`9cfefe38`](https://github.com/jspsych/jsPsych/commit/9cfefe388a216c55c8363d7b3810e5e648d9ed69) Thanks [@jsato8094](https://github.com/jsato8094)! - Add `input_type` parameter for questions of type `text`

### Patch Changes

- [#2632](https://github.com/jspsych/jsPsych/pull/2632) [`a17f423f`](https://github.com/jspsych/jsPsych/commit/a17f423f18df24c73baeb06d4079f9f2f9211386) Thanks [@bjoluc](https://github.com/bjoluc)! - Improve browser compatibility when loading via `unpkg.com`, i.e. when using the `dist/index.browser.min.js` build artifact.

* [#2625](https://github.com/jspsych/jsPsych/pull/2625) [`0f6c0be7`](https://github.com/jspsych/jsPsych/commit/0f6c0be78a1c613e0f244f8995a5a15b83dd3256) Thanks [@jsato8094](https://github.com/jsato8094)! - Export css files in `package.json`

## 0.1.1

### Patch Changes

- [#2370](https://github.com/jspsych/jsPsych/pull/2370) [`04f362af`](https://github.com/jspsych/jsPsych/commit/04f362afe82428888e9dbe64bb131d3bf07dd947) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added the CSS folder to package.json so that it will be included.

## 0.1.0

### Minor Changes

- [#2265](https://github.com/jspsych/jsPsych/pull/2265) [`d9dc2507`](https://github.com/jspsych/jsPsych/commit/d9dc25077136da98d04a4167d0d565011129d389) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - A plugin for presenting one or more pages with survey-type questions, such as multiple choice, multiple selection, free text responses, drop-down selection, and likert scale matrices.
  Provides options for response validation and question/option randomization.
  Uses the SurveyJS library: https://surveyjs.io/.
