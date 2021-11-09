# survey

The survey displays one or more questions of different types, on one or more pages that the participant can navigate. 
The supported question types are: "drop-down", "likert", "likert-table", "multi-choice", "multi-select", "ranking", "text". 
There is also an "html" type for adding arbitrary HTML-formatted content (without any associated response field) in the question set.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

### Survey parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
pages | array | *undefined* | An array of arrays. Each inner array contains the content for a single page, which is made up of one or more question objects. 
randomize_question_order | boolean | `false` | If `true`, the display order of the questions within each survey page is randomly determined at the start of the trial. In the data object, if question `name` values are not provided, then `P0_Q0` will refer to the first question in the first page array, regardless of where it was presented visually.
button_label_next | string |  'Continue' | Label of the button to move forward to the next page, or finish the survey.
button_label_previous | string | 'Back' | Label of the button to move to a previous page in the survey.
button_label_finish | string | 'Finish' | Label of the button to submit responses.
autocomplete | boolean | `false` | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to `true` will enable autocomplete or auto-fill for the form.
show_question_numbers | string | "off" | One of: "on", "onPage", "off". If "on", questions will be labelled starting with "1." on the first page, and numbering will continue across pages. If "onPage", questions will be labelled starting with "1.", with separate numbering on each page. If "off", no numbers will be added before the question prompts. Note: HTML question types are ignored in automatic numbering.
title | string | `null` | If specified, this text will be shown at the top of the survey pages. This parameter provides a method for fixing any arbitrary text to the top of the page when randomizing the question order with the `randomize_question_order` parameter (since HTML question types are also randomized).
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

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response to each question. The object will have a separate key (variable) for each question, with the first question on the first page being recorded in `P0_Q0`, the second question on the first page in `P0_Q1`, and so on. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. The response type will depend on the question type. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. Note that, if any questions use the `other` option (`add_other_option: true`), then the response value will be the `other_option_text` (e.g. "Other") and any text written in the textbox will be saved as "(question name)-Comment". |
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response(s) are submitted. |
question_order | array | An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

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
                type: 'text'
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
                type: 'multi-select'
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
          button_label_finish: 'Submit'
          show_question_numbers: 'onPage'
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-demo2.html">Open demo in new tab</a>

???+ example "Randomization of question and choice order"
    === "Code"

        ```javascript
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo3.html">Open demo in new tab</a>

???+ example "Response scoring and validation"
    === "Code"

        ```javascript
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo4.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo4.html">Open demo in new tab</a>