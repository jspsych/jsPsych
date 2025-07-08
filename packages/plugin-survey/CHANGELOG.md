# @jspsych/plugin-survey

## 3.0.0

### Major Changes

- [#3554](https://github.com/jspsych/jsPsych/pull/3554) [`c5ccbd35786c9d9f92d3f3806d6d3900e7b6f8ab`](https://github.com/jspsych/jsPsych/commit/c5ccbd35786c9d9f92d3f3806d6d3900e7b6f8ab) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - This release updates the SurveyJS version from 1.9.138 to 2.2.0. See the SurveyJS [release notes](https://surveyjs.io/stay-updated/release-notes) and list of [breaking changes](https://surveyjs.io/stay-updated/breaking-changes) for complete information. This update includes some bug fixes and improvements to SurveyJS that, while mostly minor, could change the appearance and functionality of existing jsPsych `survey` trials in unexpected ways. It also includes major (breaking) changes to the SurveyJS form library API that could affect users. Please test your experiments carefully when updating this plugin, and consult the SurveyJS release notes and other documentation for specifics.

  - **New SurveyJS features**:
    - New slider and range slider question types.
    - Support for recursive question numbering.
    - In dynamic panels, the new `templateQuestionTitleWidth` property allows you to align question titles and input fields.
    - In dropdown and tag box questions, you can now allow user-defined choice options.
    - New loop and merge feature allows you to repeat a group of questions and combine the responses into one data object. It can be used to present a fixed set of questions, or dynamically repeat questions in response to the participant's responses.
    - New `round()` and `trunc()` functions that can be used for calculations in expressions.
    - The `dateDiff()` function now includes hours and minutes.
    - In checkbox questions, you can create a custom exclusive option that clears all other selected choices in the same question when selected.
  - **Breaking changes** that affect plugin users:
    - Survey element titles no longer use HTML heading tags (`<h1>`-`<h6>`). You may need to make changes if you use these tags as selectors for custom code/CSS.
    - Question numbering is disabled by default. If you use question numbering, you may need to add `showQuestionNumbers: true` to your top-level survey JSON, or `survey.showQuestionNumbers = true;` to your survey function.
    - The default logo sizes in the survey header have changed from 200 px H x 300 px W, to 40 px H x "auto" W (preserving original aspect ratio).
    - When multiple choice and checkbox items are presented in multiple columns, they are now laid out column-by-column instead of row-by-row.
    - In image picker questions, the images were previously capped in size but now fill the available space. You can set an upper limit on the image height/width with the `maxImageWidth` and `maxImageHeight` parameters.
    - There have been a number of form library API members (properties, methods, events) that have been [deprecated](https://surveyjs.io/stay-updated/release-notes/v2.0.0#obsolete-form-library-api) or [removed](https://surveyjs.io/stay-updated/release-notes/v2.0.0#removed-form-library-api).
  - **Developer-facing changes**:
    - SurveyJS UI package changed from survey-knockout-ui (removed in survey-core v2) to survey-js-ui (i.e. the Vanilla JS option).
    - SurveyJS v1 -> v2 code migration changes.
    - Hides a rollup build warning due to the use of top-level 'this' by SurveyJS.
    - Adds a `resizeObserver` mock to fix broken tests caused by SurveyJS's dependence on `resizeObserver`.
    - Creates a new survey container div on the display element to render into, to fix a rendering bug introduced by the SurveyJS update.
  - **Other plugin changes**:
    - Adds a **minified version of the plugin's CSS file**, `survey.min.css`, and loads it in the plugin example files.
    - In the docs and example files, (1) updates the `button_html` parameter value from a string to a function (for `*-button-response` v2 migration), (2) removes `showQuestionNumbers: false`, as that is now the default.
    - Adds a new "slider_scale.html" example to the plugin's examples folder. Thanks @Max-Lovell!

## 2.1.0

### Minor Changes

- [#3385](https://github.com/jspsych/jsPsych/pull/3385) [`3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc`](https://github.com/jspsych/jsPsych/commit/3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc) Thanks [@cherriechang](https://github.com/cherriechang)! - Added citations property to info field of all plugins/extensions in two citation formats (apa, bibtex); added getCitations() as function in jsPsych package allowing user to generate citations by passing an array of plugins/extensions by name as first input and citation format as string as second input; changed template of plugins/extensions to contain citations field by default; citations for each plugin/extension are automatically generated from .cff file (if any) at its folder's root during build process; getCitations() prints out citations in the form of a string separating each citation with newline character, and always prints the jsPsych library citation first.

## 2.0.1

### Patch Changes

- [#3451](https://github.com/jspsych/jsPsych/pull/3451) [`7ffc644d`](https://github.com/jspsych/jsPsych/commit/7ffc644d0469cb5625efc5f1bb043d3aee22c501) Thanks [@jadeddelta](https://github.com/jadeddelta)! - fix `response` data type to be just `ParameterType.OBJECT`

## 2.0.0

### Major Changes

- [#3339](https://github.com/jspsych/jsPsych/pull/3339) [`74b4adc7`](https://github.com/jspsych/jsPsych/commit/74b4adc702747a62a201575a6aa95770eeddb1bb) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `finishTrial()` now clears the display and any timeouts set with `pluginApi.setTimeout()`

### Minor Changes

- [#3326](https://github.com/jspsych/jsPsych/pull/3326) [`c5a0dbb1`](https://github.com/jspsych/jsPsych/commit/c5a0dbb17ead8e2b860c76fce7fea834f3b0ad09) Thanks [@vzhang03](https://github.com/vzhang03)! - Updated all plugins to implement new pluginInfo standard that contains version, data generated and new documentation style to match migration of docs to be integrated with the code and packages themselves"

## 1.0.1

### Patch Changes

- [#3287](https://github.com/jspsych/jsPsych/pull/3287) [`54e04dc9`](https://github.com/jspsych/jsPsych/commit/54e04dc93f54a7a019db1fee4961dcc5e02b6fc0) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - This fixes the incorrect width for dropdown question options (#3286) and cleans up code/comments.

## 1.0.0

### Major Changes

- [#3204](https://github.com/jspsych/jsPsych/pull/3204) [`6d99a71f`](https://github.com/jspsych/jsPsych/commit/6d99a71fb19365ba4a968aaa5025a6b7dbb23135) Thanks [@becky-gilbert](https://github.com/becky-gilbert)! - To take advantage of all of the SurveyJS features, we have re-written the survey plugin so that it now takes a SurveyJS-compatible JavaScript/JSON object ('survey_json') and/or a SurveyJS-compatible function ('survey_function') that manipulates a SurveyJS model. This is a breaking change. See the jsPsych Survey Plugin page for documentation and examples: https://www.jspsych.org/latest/plugins/survey/. More details about creating the SurveyJS JSON configuration and functions can be found on their website: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-a-survey-model.

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
