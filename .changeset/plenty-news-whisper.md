---
"@jspsych/plugin-survey": major
---

This release updates the SurveyJS version from 1.9.138 to 2.2.0. See the SurveyJS [release notes](https://surveyjs.io/stay-updated/release-notes) and list of [breaking changes](https://surveyjs.io/stay-updated/breaking-changes) for complete information. This update includes some bug fixes and improvements to SurveyJS that, while mostly minor, could change the appearance and functionality of existing jsPsych `survey` trials in unexpected ways. It also includes major (breaking) changes to the SurveyJS form library API that could affect users. Please test your experiments carefully when updating this plugin, and consult the SurveyJS release notes and other documentation for specifics.

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