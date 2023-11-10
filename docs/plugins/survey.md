# survey

Current version: 0.2.2. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-survey/CHANGELOG.md).

The survey plugin displays one or more questions of different types, on one or more pages that the participant can navigate. This plugin is built on top of the [SurveyJS](https://surveyjs.io/) library.

The supported question types are: 

- [`"drop-down"`](#drop-down) for presenting a question with a limited set of options in a drop-down menu. The participant can only select one option. 
- [`"likert"`](#likert) for presenting a prompt along with a discrete rating scale.
- [`"likert-table"`](#likert-table) for presenting a prompt along with a table of statements/questions (rows) and repeated response options for each statement/question (columns).
- [`"multi-choice"`](#multi-choice) for presenting a question with a limited set of options. The participant can only select one option.
- [`"multi-select"`](#multi-select) for presenting a question with a limited set of options. The participant can select multiple options.
- [`"ranking"`](#ranking) for presenting a question with a limited set of options, where participants respond by dragging and dropping (ordering/ranking) the options.
- [`"text"`](#text) for presenting a question with a free response text field in which the participant can type in an answer.

There is also an [`"html"`](#html) type for adding arbitrary HTML-formatted content (without any associated response field) in the question set.

!!! warning
    Development on this plugin is ongoing and we plan to incorporate more of the features that [SurveyJS](https://surveyjs.io/) provides. Prior to release of version `1.0` of the plugin, we expect the parameters and implementation of this plugin to change. We recommend performing a little bit of extra testing with any experiments that utilize this plugin. 

## CSS

This plugin uses an additional stylesheet called `survey.css`. You can load it via: 

```html
<link rel="stylesheet" href="https://unpkg.com/@jspsych/plugin-survey@0.2.2/css/survey.css">
```

If you are using a bundler such as [webpack](https://webpack.js.org/), you can also import it in JavaScript as follows, depending on your bundler configuration:
```javascript
import '@jspsych/plugin-survey/css/survey.css'
```

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

### Survey parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
pages | array | *undefined* | An array of arrays. Each inner array contains the content for a single page, which is made up of one or more question objects. 
button_label_next | string |  'Continue' | Label of the button to move forward to the next page, or finish the survey.
button_label_back | string | 'Back' | Label of the button to move to a previous page in the survey.
button_label_finish | string | 'Finish' | Label of the button to submit responses.
autocomplete | boolean | `false` | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to `true` will enable autocomplete or auto-fill for the form.
show_question_numbers | string | "off" | One of: "on", "onPage", "off". If "on", questions will be labelled starting with "1." on the first page, and numbering will continue across pages. If "onPage", questions will be labelled starting with "1.", with separate numbering on each page. If "off", no numbers will be added before the question prompts. Note: HTML question types are ignored in automatic numbering.
title | string | `null` | If specified, this text will be shown at the top of the survey pages.
required_error | string | "Please answer the question." | Text to display if a required question is not responeded to.
required_question_label | string | "*" | String to display at the end of required questions. Use an empty string ("") if you do not want to add a label to the end of required questions.

### Question types and parameters

#### Parameters for all question types

Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
type | string | *undefined* | The question type. Options are: "drop-down", "html", "likert", "likert-table", "multi-choice", "multi-select", "ranking", "rating", "text".
prompt | string | *undefined* | The prompt/question that will be associated with the question's response field. If the question type is "html", then this string is the HTML-formatted string to be displayed. If the question type is "likert-table", the prompt is a general question or title presented above the table.
required | boolean | `false` | Whether a response to the question is required (`true`) or not (`false`), using the HTML5 `required` attribute. 
name | string | `null` | Name of the question to be used for storing data. If this parameter is not provided, then default names will be used to identify the questions in the data: `P0_Q0`, `P0_Q1`, `P1_Q0` etc. Question names must be unique across all pages within the trial.

#### Drop-down

Present a question with a limited set of options in a drop-down menu. The participant can only select one option.

In addition to the parameters for all question types, the drop-down question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
options | array of strings | *undefined* | This array contains the set of multiple choice options to display for the question.
option_reorder | string | "none" | One of: "none", "asc", "desc", "random". If "none", the options will be listed in the order given in the `options` array. If `random`, the option order will be randomized. If "asc" or "desc", the options will be presented in ascending or descending order, respectively.
correct_response | string | null | String from the `options` array that should be considered correct. If specified, the data will include a `correct` property that indicates whether the response was correct (`true`) or not (`false`).

#### HTML

Present arbitrary HTML-formatted content embedded in the list of questions, including text, images, and sounds. There are no response options.

The only available parameters are those listed for all question types with a default value of *undefined* (`type` and `prompt`) and `name`. 
The `name` parameter is optional and used to identify the question in the data, with a response value of `null`. 
The `required` parameter will be ignored.

#### Likert

Present a prompt along with a discrete rating scale. The scale values are presented as buttons that can be selected and de-selected. 
The scale is specified by the `likert_scale_values` parameter, which is an array of text labels and associated values, or it is generated using the `likert_rating_min`/`max`/`stepsize` parameters (along with optional maximum/minimum descriptions). 

In addition to the parameters for all question types, the likert question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
likert_scale_values | array of objects | `null` | Array of objects that defines the rating scale labels and associated values to be stored in the data. Each object defines a single rating option. The objects must have a `value` property, which is an integer or string value that will be stored as the response in the data. The objects can optionally have a `text` property, which is a string that will be displayed for that rating option (example: `[{value: 1, text: "A lot"},{value: 2, text: "Somewhat"},{value: 3, text: "Not much"}]`). If no `text` property is specified then the `value` will be displayed (examples: `[{value: 1},{value: 2},{value: 3}]`, `[{value: "Yes"},{value: "Maybe"},{value: "No"}]`). If provided, this parameter will override the `likert_rating_min`/`max`/`stepsize` parameters.
likert_scale_min | integer | 1 | If the `likert_scale_values` array is not specified, then this parameter will define the minimum scale value. 
likert_scale_max | integer | 5 | If the `likert_scale_values` array is not specified, then this parameter will define the maximum scale value. 
likert_scale_stepsize | integer | 1 | If the `likert_scale_values` array is not specified, then this parameter will define the step size that should be used for generating rating options between the minimum and maximum values. 
likert_scale_min_label | string | `null` | Description for the minimum (first) rating option. If provided, this text will be shown inside the first rating button, before the rating text/value. This parameter is meant for defining the scale's minimum when integer values are used for the rating scale buttons.
likert_scale_max_label | string | `null` | Description for the maximum (last) rating option. If provided, this text will be shown inside the first rating button, after the rating text/value. This parameter is meant for defining the scale's maximum when integer values are used for the rating scale buttons.

#### Likert-table

Present a prompt along with a table of statements/questions (rows) and repeated response options for each statement/question (columns). 

In addition to the parameters for all question types, the likert-table question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
statements | array of objects | *undefined* | This array contains one or more objects representing the statements/questions to be presented in the table rows. Each object must have a `prompt`, which is the statement/question text. The objects can optionally include a `name`, which is how the statement should be identified in the data. If no `name` is provided, then the default values of "S0", "S1" etc. will be used.
options | array of strings | *undefined* | This array contains the set of multiple choice options to be presented in the table columns.
randomize_statement_order | boolean | `false` | If `true`, the order of statements/questions in the `statements` array will be randomized.

#### Multi-choice

Present a question with a limited set of options. The participant can only select one option.

In addition to the parameters for all question types, the multi-choice question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
options | array of strings | *undefined* | This array contains the set of multiple choice options to display for the question.
option_reorder | string | "none" | One of: "none", "asc", "desc", "random". If "none", the options will be listed in the order given in the `options` array. If `random`, the option order will be randomized. If "asc" or "desc", the options will be presented in ascending or descending order, respectively.
columns | integer | 1 | Number of columns to use for displaying the options. If 1 (default), the choices will be displayed in a single column (vertically). If 0, choices will be displayed in a single row (horizontally). Any value greater than 1 can be used to display options in multiple columns. 
correct_response | string | null | String from the `options` array that should be considered correct. If specified, the data will include a `correct` property that indicates whether the response was correct (`true`) or not (`false`).

#### Multi-select

Present a question with a limited set of options. The participant can select multiple options.

In addition to the parameters for all question types, the multi-select question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
options | array of strings | *undefined* | This array contains the set of options to display for the question.
option_reorder | string | "none" | One of: "none", "asc", "desc", "random". If "none", the options will be listed in the order given in the `options` array. If `random`, the option order will be randomized. If "asc" or "desc", the options will be presented in ascending or descending order, respectively.
columns | integer | 1 | Number of columns to use for displaying the options. If 1 (default), the choices will be displayed in a single column (vertically). If 0, choices will be displayed in a single row (horizontally). Any value greater than 1 can be used to display options in multiple columns. 
correct_response | array of strings | null | Array of one or more strings from the `options` array that should be considered correct. If specified, the data will include a `correct` property that indicates whether the response was correct (`true`) or not (`false`).

#### Ranking

Present a question with a limited set of options, where participants respond by dragging and dropping (ordering/ranking) the options. It is ideally used with a short list of options (up to about 7 items). It supports mouse responses, touch responses (mobile devices), and keyboard responses (Tab and Shift-Tab to select, and Up/Down arrow keys to re-order).

In addition to the parameters for all question types, the ranking question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
options | array of strings | *undefined* | This array contains the set of to-be-ranked options for the question.
option_reorder | string | "none" | One of: "none", "asc", "desc", "random". If "none", the options will be listed in the order given in the `options` array. If `random`, the option order will be randomized. If "asc" or "desc", the options will be presented in ascending or descending order, respectively.
correct_response | array of strings | null | The same array of strings used for the `options` array, but listed in the order that should be considered correct. If specified, the data will include a `correct` property that indicates whether the response was correct (`true`) or not (`false`).

#### Text

Present a question with a free response text field in which the participant can type in an answer.

In addition to the parameters for all question types, the text question also offers the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
placeholder | string | "" | Placeholder text in the text response field. 
textbox_rows | integer | 1 | The number of rows (height) for the response text box. 
textbox_columns | integer | 40 | The number of columns (width) for the response text box. 
validation | string | "" | A regular expression used to validate the response.
input_type | string | "text" | Type for the HTML `<input>` element. The `input_type` parameter must be one of "color", "date", "datetime-local", "email", "month", "number", "password", "range", "tel", "text", "time", "url", "week". If the `textbox_rows` parameter is larger than 1, the `input_type` parameter will be ignored. The `textbox_columns` parameter only affects questions with `input_type` "email", "password", "tel", "url", or "text".

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response to each question. The object will have a separate key (variable) for each question, with the first question on the first page being recorded in `P0_Q0`, the second question on the first page in `P0_Q1`, and so on. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. The response type will depend on the question type. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. Note that, if any questions use the `other` option (`add_other_option: true`), then the response value will be the `other_option_text` (e.g. "Other") and any text written in the textbox will be saved as "(question name)-Comment". |
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. |

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-survey@0.2.2"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-survey
```
```js
import survey from '@jspsych/plugin-survey';
```

## Examples

???+ example "Basic single page"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurvey,
          pages: [
            [
              {
                type: 'html',
                prompt: 'Please answer the following questions:',
              },
              {
                type: 'multi-choice',
                prompt: "Which of the following do you like the most?", 
                name: 'VegetablesLike', 
                options: ['Tomato', 'Cucumber', 'Eggplant', 'Corn', 'Peas'], 
                required: true
              }, 
              {
                type: 'multi-select',
                prompt: "Which of the following do you like?", 
                name: 'FruitLike', 
                options: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry'], 
                required: false,
              }
            ]
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo1.html">Open demo in new tab</a>

???+ example "Multiple pages, more customization"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurvey,
          pages: [
            [
              {
                type: 'text',
                prompt: "Where were you born?", 
                placeholder: 'City, State, Country',
                name: 'birthplace', 
                required: true,
              }, 
              {
                type: 'text',
                prompt: "How old are you?", 
                name: 'age', 
                textbox_columns: 5,
                required: false,
              }
            ],
            [
              {
                type: 'multi-choice',
                prompt: "What&#39;s your favorite color?", 
                options: ['blue','yellow','pink','teal','orange','lime green','other','none of these'],
                name: 'FavColor', 
              }, 
              {
                type: 'multi-select',
                prompt: "Which of these animals do you like? Select all that apply.", 
                options: ['lion','squirrel','badger','whale'],
                option_reorder: 'random',
                columns: 0,
                name: 'AnimalLike', 
              }
            ]
          ],
          title: 'My questionnaire',
          button_label_next: 'Continue',
          button_label_back: 'Previous',
          button_label_finish: 'Submit',
          show_question_numbers: 'onPage'
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo2.html">Open demo in new tab</a>

???+ example "Single and multiple item Likert-style scales"
    === "Code"

        ```javascript
        const trial = {
          type: jsPsychSurvey,
          pages: [
            [
              {
                type: 'likert',
                prompt: 'I like to eat vegetables.',
                likert_scale_min_label: 'Strongly Disagree',
                likert_scale_max_label: 'Strongly Agree',
                likert_scale_values: [
                  {value: 1},
                  {value: 2},
                  {value: 3},
                  {value: 4},
                  {value: 5}
                ]
              }, 
              {
                type: 'likert',
                prompt: 'I like to eat fruit.',
                likert_scale_min_label: 'Strongly Disagree',
                likert_scale_max_label: 'Strongly Agree',
                likert_scale_values: [
                  {value: 1},
                  {value: 2},
                  {value: 3},
                  {value: 4},
                  {value: 5}
                ]
              },
              {
                type: 'likert',
                prompt: 'I like to eat meat.',
                likert_scale_min_label: 'Strongly Disagree',
                likert_scale_max_label: 'Strongly Agree',
                likert_scale_values: [
                  {value: 1},
                  {value: 2},
                  {value: 3},
                  {value: 4},
                  {value: 5}
                ]
              },  
              
            ],
            [
              {
                type: 'likert-table',
                prompt: ' ',
                statements: [
                  {prompt: 'I like to eat vegetables', name: 'VeggiesTable'},
                  {prompt: 'I like to eat fruit', name: 'FruitTable'},
                  {prompt: 'I like to eat meat', name: 'MeatTable'},
                ],
                options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
              }
            ]
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo3.html">Open demo in new tab</a>

???+ example "Response scoring"
    === "Code"

        ```javascript
        const trial = {
          type: jsPsychSurvey,
          pages: [
            [
              {
                type: 'multi-choice',
                prompt: 'During the experiment, are allowed to write things down on paper to help you?',
                options: ["Yes", "No"],
                correct_response: "No",
                required: true
              }, 
            ]
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo4.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo4.html">Open demo in new tab</a>

???+ example "Adding data to trial"
    When adding any data to a Survey trial, you should add it via the `data` parameter at the whole-trial level (not inside the question objects), even if it only relates to one question out of multiple questions/pages contained wihtin the trial.
    === "Code"

        ```javascript
        const question_info = [
          {
            'fruit': 'apples',
            'Q1_prompt': 'Do you like apples?', 
            'Q1_type': 'regular'
          },
          {
            'fruit': 'bananas',
            'Q1_prompt': 'Do you NOT like bananas?', 
            'Q1_type': 'reverse'
          },
        ];

        const survey = {
          type: jsPsychSurvey,
          pages: [
            [
              {
                type: 'multi-choice',
                prompt: jsPsych.timelineVariable('Q1_prompt'),
                options: ['Yes', 'No'],
                name: 'Q1'
              },
              {
                type: 'text',
                prompt: function() {
                  return `What's your favorite thing about ${jsPsych.timelineVariable('fruit')}?`;
                },
                name: 'Q2'
              }
            ]
          ],
          // Add data at the whole-trial level here
          data: {
            'Q1_prompt': jsPsych.timelineVariable('Q1_prompt'),
            'Q1_type': jsPsych.timelineVariable('Q1_type'),
            'fruit': jsPsych.timelineVariable('fruit')                                                        
          },
          button_label_finish: 'Continue'                
        };

        const survey_procedure = {
          timeline: [survey],
          timeline_variables: question_info,
          randomize_order: true
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo5.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo5.html">Open demo in new tab</a>