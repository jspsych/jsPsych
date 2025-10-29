---
"@jspsych/plugin-survey": major
---

This release improves the appearance of `survey` trials on mobile devices. It removes the custom CSS classes that were used in previously because they conflicted with SurveyJS's built-in mobile/responsive styling. As a result, this plugin version no longer uses the following CSS classes (all specific to the `survey` plugin): "jspsych-body", "jspsych-body-container", "jspsych-question-content", "jspsych-question-root", "jspsych-page", "jspsych-footer","jspsych-nav-complete", "jspsych-row-multiple". If your code references these classes, you should switch to the corresponding SurveyJS classes when upgrading to this plugin version.

This adds a new `min_width` plugin parameter that can be used to minimum width of the survey container. This is applied as a CSS `min-width` property to the survey container element.

This release also updates the SurveyJS version from 2.2.0 to 2.3.12. See the SurveyJS [release notes](https://surveyjs.io/stay-updated/release-notes) and list of [breaking changes](https://surveyjs.io/stay-updated/breaking-changes) for complete information. This update includes some bug fixes and improvements to SurveyJS that, while mostly minor, could change the appearance and functionality of existing jsPsych `survey` trials in unexpected ways. It also includes major (breaking) changes to the SurveyJS form library API that could affect users who use the API. Please test your experiments carefully when updating this plugin, and consult the SurveyJS release notes and other documentation for specifics.

- **Some new SurveyJS features**:
  - Comment fields for individual choice options. For single- and multi-select questions (Checkboxes, Radio Button Group, and Dropdown), you can configure a comment field to appear when that choice is selected to allow the participant to provide additional information.
  - Checkbox matrix (table) question. This allows participants to select multiple options per matrix/table row, rather than only being able to respond with a single option (radio button).
  - New API event for intercepting or canceling expression evaluation.
  - Slider and Range Slider question types can now be used as cell editors in Multi-Select and Dynamic Matrices (tables).
  - Exclusive columns in checkbox matrix questions. You can set any of the response columns in a multi-select matrix/table question to be an exclusive column. When an exclusive column is selected, all other checkboxes in the same row are automatically deselected. This is useful for options like "None", "Refuse to answer", or "Don't know".
  - Better control over scale labels and tooltip visibility in Slider and Range Slider questions:
    - When using custom labels, you can now show both the label and its corresponding value. 
    - Slider and Range Slider tooltips can be set to be always visible instead of just on hover or focus.
  - Nested content within choice options. You can now embed conditional questions/panels inside Checkboxes and Radio Button Group options for follow-up questions.