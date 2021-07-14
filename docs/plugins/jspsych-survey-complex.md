# jspsych-survey-complex

This plugin allows you to ask a single question to participants where they select one (single-choice) or multiple (multi-choice) answers. Each answer option may be accompanied by an explanation and a text box. This is useful when you, for example, want to include an "Other" option that takes text as input.

## Parameters
In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
question_id | string | "" (nothing) | Optional. An easy identifier to be added to the question. Not necessary for the plugin to work, but rather can be used for easier data-processing afterwards.
question_text | HTML_string | *undefined* | The main question you want to display. The default styling will ensure that this is the most prominent text on screen.
question_subtext | HTML_string | "" (nothing) | Optional. The subtext presented underneath the main question. This can be used, for example, to explain why a concept in your question means. The default styling will ensure that this is shown in less prominent font than the main question.
answers | array | *undefined* | A nested array of parameters (discussed below) specifying each of the answer options separately
answers > answers_text | HTML_string | *undefined* | The label/value/text corresponding to the answer option.
answers > answer_explanation | HTML_STRING | *undefined* | Optional. A subtext to be added below the answer option. There are two user-cases for this subtext. First you can use it to clarify your answer option by providing a definition or explanation. Second, when using the `text` option it can be used to let participants know what to enter in the textbox.
answers > answer_type | string | *undefined* | One of the four options (see examples below). `single-choice`; `single-choice-text`; `multi-choice`; `multi-choice-text`.
answers > answer_consequence | string | "Continue" | Optional. A parameter that can be used in combination with conditional nodes. Allowing one to create a logic where some answer options may cause you to abort a trial/loop/experiment. Accepted values: "Continue" or "Stop".
submit_text | string | "Save & Continue" | The text to be displayed on the button below the question/form. Pressing the button triggers the submitting of the answer and the end of the trial.
error_message | string | "You must select at least one answer." | The message to be displayed next to the submit button. *Note* this message disappears when the participant has selected an answer.


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
question_id | string | A unique identifier passed down to each question. Defaults to an empty string.
response_time | numeric | The response time in milliseconds
response | nested-array | For each answer option both the label/value `answer_text` and any text entered in a `textbox` are saved. If multiple answers were possible these will all be saved.
stop_questionnaire | boolean | A value that can be used to determine whether the selected answer option (as indicated by `answer_consequence`) should cause the participant to stop the trial/loop/experiment. Defaults to `false`.


## Examples

| WARNING          |
|:---------------------------|
| This plugin relies on additional css (`css/jspsych-survey-complex.css`). Add it to your `.html` file similarly to the normal `css/jspsych.css` file.  |

### Single Choice
Participants can select only one of the answer options.

```javascript
var demo_trial = {
        // custom plugin type
        type: "survey-complex",
        question_id: "single-choice",
        // question header (larger font)
        question_text: "Simple Question",
        // question explanation (smaller font)
        question_subtext:
          "With a simple explanation of what to do. It is also possible to add <em> additional html styling </em>",
        // Text to display on form submit button
        button_label: "Save & Continue",
        // Each of the answer options to be displayed
        answers: [
          {
            // Label
            answer_text: "answer_type: single-choice",
            // Explanations
            answer_explanation: "",
            // Input type
            answer_type: "single-choice",
            // Consequence
            answer_consequence: "Continue",
          },
          {
            // Label
            answer_text: "answer_type: single-choice-text",
            // Explanations
            answer_explanation: "Please tell us why you selected this answer: ",
            // Input type
            answer_type: "single-choice-text",
            // Consequence
            answer_consequence: "Continue",
          },
        ],
      };
```

### Multi Choice
Participants can select one or more answer options.

```javascript
var demo_trial = {
        // custom plugin type
        type: "survey-complex",
        question_id: "single-choice",
        // question header (larger font)
        question_text: "Simple Question",
        // question explanation (smaller font)
        question_subtext:
          "With a simple explanation of what to do. It is also possible to add <em> additional html styling </em>",
        // Text to display on form submit button
        button_label: "Save & Continue",
        // Each of the answer options to be displayed
       answers: [
          {
            // Label
            answer_text: "answer_type: multi-choice",
            // Explanations
            answer_explanation: "",
            // Input type
            answer_type: "multi-choice",
            // Consequence
            answer_consequence: "Continue",
          },
          {
            // Label
            answer_text: "answer_type: multi-choice-text",
            // Explanations
            answer_explanation: "",
            // Input type
            answer_type: "multi-choice-text",
            // Consequence
            answer_consequence: "Continue",
          },
       ],
      };
```