---
"@jspsych/plugin-survey": minor
---

- Updates the SurveyJS version from 1.9.138 to 2.2.0. See the SurveyJS [release notes](https://surveyjs.io/stay-updated/release-notes) and list of [breaking changes](https://surveyjs.io/stay-updated/breaking-changes).
- Adds a minified version of the plugin's CSS file, survey.min.css, and loads it in the plugin example files.
- In the docs and example files, updates the `button_html` parameter value from a string to a function (for `*-button-response` v2 migration).
- Developer-facing changes:
  - Changes the SurveyJS UI package from survey-knockout-ui (removed in survey-core v2) to survey-js-ui.
  - Makes SurveyJS v1 -> v2 code migration changes.
  - Hides a rollup build warning due to the use of top-level 'this' by SurveyJS.
  - Adds a `resizeObserver` mock to fix broken tests caused by SurveyJS's dependence on `resizeObserver`.