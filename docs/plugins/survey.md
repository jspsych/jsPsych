# survey

The survey displays one or more questions of different types, on one or more pages that the participant can navigate. 
The supported question types are: "drop-down", "likert", "multi-choice", "multi-select", "ranking", "rating", "text". 
There is also an "html" type for adding arbitrary HTML-formatted content (without any associated response field) in the question set.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

### Survey parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
pages | array | *undefined* | An array of arrays. Each inner array contains the content for a single page, which is made up of one or more question objects. 
randomize_question_order | boolean | `false` | If `true`, the display order of the questions within each survey page is randomly determined at the start of the trial. In the data object, if question `name` values are not provided, then `Q0` will refer to the first question in the array, regardless of where it was presented visually.
button_label_next | string |  'Continue' | Label of the button to move forward to the next page, or finish the survey.
button_label_previous | string | 'Back' | Label of the button to move to a previous page in the survey.
autocomplete | boolean | false | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to `true` will enable autocomplete or auto-fill for the form.

### Question types and parameters

#### Parameters for all question types

Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
type | string | *undefined* | The question type. Options are: "drop-down", "html", "likert", "multi-choice", "multi-select", "ranking", "rating", "text".
prompt | string | *undefined* | The prompt/question that will be associated with the question's response field. If the question type is "html", then this string is the HTML-formatted string to be displayed. 
required | boolean | false | Whether a response to the question is required (`true`) or not (`false`), using the HTML5 `required` attribute. 
name | string | null | Name of the question to be used for storing data. If left undefined then default names will be used to identify the questions in the data: `Q0`, `Q1`, etc.

#### Multi-choice

In addition to the parameters for all question types, the multi-choice question type also offers the following parameters. 
Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
options | array of strings | *undefined* | This array contains the set of multiple choice options to display for the question.
horizontal | boolean | false | If `true`, then the question is centered and the options are displayed horizontally. 

#### Text

Present a question with a free response text field in which the participant can type in an answer.

In addition to the parameters for all question types, the text question also offers the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
value | string | "" | Placeholder text in the text response field. 
rows | integer | 1 | The number of rows for the response text box. 
columns | integer | 40 | The number of columns for the response text box. 
validation | string | "" | A regular expression used to validate the response.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label selected (string). If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response(s) are submitted. |
question_order | array | An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Examples

???+ example "Multi-choice"
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
                type: 'multi-choice',
                prompt: "Which of the following do you like the least?", 
                name: 'FruitDislike', 
                options: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry'], 
                required: false
              }
            ]
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-multi-choice-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-multi-choice-demo1.html">Open demo in new tab</a>

???+ example "Text"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurvey,
          questions: [
            {
              type: 'text',
              prompt: "Where were you born?", 
              value: 'City, State, Country',
              name: 'birthplace', 
              required: true,
            }, 
            {
              type: 'text'
              prompt: "How old are you?", 
              name: 'age', 
              required: false,
            }
          ],
          randomize_question_order: true,
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-multi-choice-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-multi-choice-demo2.html">Open demo in new tab</a>
