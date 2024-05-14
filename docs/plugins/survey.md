# survey

Current version: 1.0.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-survey/CHANGELOG.md).

SurveyJS version: 1.9.138

This plugin is a wrapper for the [**SurveyJS form library**](https://surveyjs.io/form-library/documentation/overview). It displays survey-style questions across one or more pages. You can mix different question types on the same page, and participants can navigate back and forth through multiple survey pages without losing responses. SurveyJS provides a large number of built-in question types, response validation options, conditional display options, special response options ("None", "Select all", "Other"), and other useful features for building complex surveys. See the [Building Surveys in jsPsych](../overview/building-surveys.md) page for a more detailed list of all options and features.

With SurveyJS, surveys can be defined using a JavaScript/JSON object, a JavaScript function, or a combination of both. The jsPsych `survey` plugin provides parameters that accept these methods of constructing a SurveyJS survey, and passes them into SurveyJS. The fact that this plugin just acts as a wrapper means you can take advantage of all of the SurveyJS features, and copy/paste directly from SurveyJS examples into the plugin's `survey_json` parameter (for JSON object configuration) or `survey_function` parameter (for JavaScript code).

This page contains the plugin's reference information and examples. The [Building Surveys in jsPsych](../overview/building-surveys.md) page contains a more detailed guide for using this plugin.

For the most comprehensive guides on survey configuration and features, please see the [SurveyJS form library documentation](https://surveyjs.io/form-library/documentation/overview) and [examples](https://surveyjs.io/form-library/examples/overview).

!!! warning "Limitations"

    The jsPsych `survey` plugin is not compatible with certain jsPsych and SurveyJS features. Specifically:

    - **It is not always well-suited for use with jsPsych's [timeline variables](../overview/timeline.md#timeline-variables) feature.** This is because the timeline variables array must store the entire `survey_json` object for each trial, rather than just the parameters that change across trials, which are nested within the `survey_json` object. We offer some alternative methods for dynamically constructing questions/trials in [this section](../overview/building-surveys.md#defining-survey-trialsquestions-programmatically) of the Building Surveys in jsPsych documentation page.
    - **It does not support the SurveyJS "[complete page](https://surveyjs.io/form-library/documentation/design-survey/create-a-multi-page-survey#complete-page)" parameter.** This is a parameter for HTML formatted content that should appear after the participant clicks the 'submit' button. Instead of using this parameter, you should create another jsPsych trial that comes after the survey trial to serve the same purpose.
    - **It does not support the SurveyJS question's `correctAnswer` property**, which is used for SurveyJS quizzes and automatic response scoring. SurveyJS does not store this value or the response score in the data - instead this is only used to display scores on the survey's 'complete page'. Since the complete page is not supported, this 'correctAnswer' property also does not work as intended in the jsPsych plugin.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. 
Parameters with a default value of *undefined* must be specified. 
Other parameters can be left unspecified if the default value is acceptable.

### Survey parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
survey_json | object | `{}` | A SurveyJS-compatible JavaScript object that defines the survey (we refer to this as the survey 'JSON' for consistency with the SurveyJS documentation, but this parameter should be a JSON-compatible JavaScript object rather than a string). If used with the `survey_function` parameter, the survey will initially be constructed with this object and then passed to the `survey_function`. See the [SurveyJS JSON documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json) for more information.
survey_function | function | null | A function that receives a SurveyJS survey object as an argument. If no `survey_json` is specified, then the function receives an empty survey model and must add all pages/elements to it. If a `survey_json` object is provided, then this object forms the basis of the survey model that is passed into the `survey_function`. See the [SurveyJS JavaScript documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically) for more information.
validation_function | function | null | A function that can be used to validate responses. This function is called whenever the SurveyJS `onValidateQuestion` event occurs. (Note: it is also possible to add this function to the survey using the `survey_function` parameter - we've just added it as a parameter for convenience).

### Question/Element Types

You must add one or more SurveyJS "element" to a survey, using the plugin's survey JSON and/or survey function parameter. SurveyJS elements are mostly made up of different question types, but also include non-response content such as HTML and images/video. The [Building Surveys in jsPsych](../overview/building-surveys.md) page contains more information about how to define survey elements, and you can see some examples in the [Examples section](#examples) on this page.

For reference, the SurveyJS question/element types are listed below, with links to more information and examples in the SurveyJS documentation. 

#### boolean

The "boolean" type is a yes/no (or other two-option) multiple choice question. It differs from the "radiogroup" (multiple choice) question type in that it offers different response format options (left/right slider button, yes/no checkbox) in addition to the standard multiple choice format (two separate radio buttons).

- [Boolean example](https://surveyjs.io/form-library/examples/yes-no-question/jquery) 
- [Boolean API documentation](https://surveyjs.io/form-library/documentation/api-reference/boolean-question-model)

#### checkbox

This checkbox question type allows participants to select one or more options from the set of choices. You can optionally include special choices, such as "Select all", "None", and "Other" with a text box that appears when selected.

- [Checkbox example](https://surveyjs.io/form-library/examples/create-checkboxes-question-in-javascript/jquery)
- [Checkbox API documentation](https://surveyjs.io/form-library/documentation/api-reference/checkbox-question-model)

#### comment

This is the "long text" question type. It's similar to the text input question, but unlike text input, you can make the comment text box larger than a single line. You can also make the box resizeable and limit the number of characters.

- [Comment example](https://surveyjs.io/form-library/examples/add-open-ended-question-to-a-form/jquery) 
- [Comment API documentation](https://surveyjs.io/form-library/documentation/api-reference/comment-field-model)

#### dropdown

The dropdown question type allows participants to select a single option from a list presented in a drop-down box. 

- [Dropdown example](https://surveyjs.io/form-library/examples/create-dropdown-menu-in-javascript/jquery) 
- [Dropdown API documentation](https://surveyjs.io/form-library/documentation/api-reference/dropdown-menu-model)

#### tagbox

This is a multi-select dropdown question type. It is similar to a dropdown question, but allows participants to select more than one response from the drop-down list.

- [Tagbox example](https://surveyjs.io/form-library/examples/how-to-create-multiselect-tag-box/jquery) 
- [Tagbox API documentation](https://surveyjs.io/form-library/documentation/api-reference/dropdown-tag-box-model)

#### expression

This is a read-only element that calculates a value based on a specified expression. This question type can be used to dynamically calculate values based on the participant's responses and/or predefined variables and display the calculated value on the page. For example, if you asked participants to estimate the percentage of their day doing various activies, you could have participants enter a percentage value for each activity, and use this 'expression' question to calculate and display the total percentage across all activities (to ensure that it does not exceed 100).

- [Expression example](https://surveyjs.io/form-library/examples/expression-question-for-dynamic-form-calculations/jquery) 
- [Expression API documentation](https://surveyjs.io/form-library/documentation/api-reference/expression-model)

#### file

This question allows participants to upload one or more files (images, documents, etc.). It provides drag-and-drop and browse/select options. Files can be uploaded to a server or stored directly in the survey results JSON object as base64-encoded text.

!!! note 
    When using this question type, you will need to choose how to handle the files. One option is to save the file with the rest of the response data as a Base64-encoded text string (`storeDataAsText: true`), but keep in mind that this will significantly increase the size of the response data and should only be used for small files. Another option is to upload the participant's file to a server, which you can do using the `onUploadFiles` event handler in the jsPsych `survey_function` function. You can read more about these options in the SurveyJS [file upload documentation](https://surveyjs.io/form-library/examples/file-upload/jquery#content-docs), and see an example of the file upload option in the `index.js` part of this [code example](https://surveyjs.io/form-library/examples/file-upload/jquery#content-code).

- [File example](https://surveyjs.io/form-library/examples/file-upload/jquery) 
- [File API documentation](https://surveyjs.io/form-library/documentation/api-reference/file-model)

#### html

Most SurveyJS question types do not support HTML markup in the display fields. The html element allows you to add custom HTML to the survey, so that you can insert images, hyperlinks, etc. 

- [HTML example](https://surveyjs.io/form-library/examples/add-html-form-field/jquery#) 
- [HTML API documentation](https://surveyjs.io/form-library/documentation/api-reference/add-custom-html-to-survey)

#### image

This element adds an image or video to the survey page.

- [Image example](https://surveyjs.io/form-library/examples/add-image-and-video-to-survey/jquery#) 
- [Image API documentation](https://surveyjs.io/form-library/documentation/api-reference/add-image-to-survey)

#### imagepicker

This question type displays images/videos and allows the participant to select one or more as their repsonse.

- [Imagepicker example](https://surveyjs.io/form-library/examples/image-picker-question/jquery)
- [Imagepicker API documentation](https://surveyjs.io/form-library/documentation/api-reference/image-picker-question-model)

#### matrix

The matrix question creates a table of multiple choice questions (rows) that use the same set of response options (columns). This is often used for presenting multiple questions/statements with a Likert or similar rating scale.

- [Matrix example](https://surveyjs.io/form-library/examples/single-selection-matrix-table-question/jquery) 
- [Matrix API documentation](https://surveyjs.io/form-library/documentation/api-reference/matrix-table-question-model)

#### matrixdropdown

This question type allows you to present a matrix (table) of questions, with different types of response options in each cell. Despite the "dropdown" part of the question type name, this question type allows not only dropdown questions in the matrix cells, but also checkbox, radiogroup, text, and comment.

- [Matrixdropdown example](https://surveyjs.io/form-library/examples/multi-select-matrix-question/jquery) 
- [Matrixdropdown API documentation](https://surveyjs.io/form-library/documentation/api-reference/matrix-table-with-dropdown-list)

#### multipletext

This question type allows you to present multiple [text questions](#text) as part of a single 'question', which can be useful if you want to group together related short-answer text input boxes (e.g. separate first/middle/last text boxes for entering full name). Each 'item' within this question type defines a single text question, and supports the text question's input types (email, date, etc.) for built-in formatting and validation. In the results, there will be a single key for this question (either the question name, if specified in the question parameters, otheriwse automatically named `questionN`), and the value will be an object with key-value pairs for each text entry 'item' (`"item1Name": "item1Response", "item2Name": "item2Response"`, etc.).

- [Multipletext example](https://surveyjs.io/form-library/examples/multiple-text-box-question/jquery) 
- [Multipletext API documentation](https://surveyjs.io/form-library/documentation/api-reference/multiple-text-entry-question-model)

#### panel

This element allows you to group related questions together. This can help with visual organization on the page, and can help participants understand the purpose of a set of questions. Panels appear as a title/description above a box that contains the panel's nested elements/questions. The panel can be initially expanded (show all questions) and collapsed (hide all questions), and users can toggle this state by clicking on the panel title.

- [Panel example](https://surveyjs.io/form-library/examples/set-properties-on-multiple-questions-using-panel/jquery) 
- [Panel API documentation](https://surveyjs.io/form-library/documentation/api-reference/panel-model)

#### paneldynamic

The paneldyanmic element allows you to set up a group of questions that repeat based on the participant's response(s) to another question. This can be useful when the participant will have an unknown number of responses, and you want to ask the same questions about each response. For instance, you could use this element type to set up a series of questions about the participant's children, employment history, favorite hobbies, etc. The paneldynamic element allows participants to add/delete the 'subpanels' (response and associated question set).

- [Paneldynamic example](https://surveyjs.io/form-library/examples/duplicate-group-of-fields-in-form/jquery) 
- [Paneldynamic API documentation](https://surveyjs.io/form-library/documentation/api-reference/dynamic-panel-model)

#### radiogroup

This is a multiple choice question type. Participants can select a single option from the set of choices. You can optionally add special choices, such as "Other" with a text box that appears when selected.

- [Radiogroup example](https://surveyjs.io/form-library/examples/single-select-radio-button-group/jquery) 
- [Radiogroup API documentation](https://surveyjs.io/form-library/documentation/api-reference/radio-button-question-model)

#### rating

The rating question type is a type of multiple-choice question that is intended for allowing participants to evaluate something on a scale. The scale can display a range of numbers, graphic symbols (stars, faces), or text labels. The scale options can be presented as a set of horizontal buttons, a drop-down menu, or "auto" (displays buttons if there is sufficient page width, otherwise drop-down; see the [Rating UI page](https://surveyjs.io/form-library/examples/ui-adaptation-modes-for-rating-scale/jquery) for more documentation and examples).

- [Rating example](https://surveyjs.io/form-library/examples/rating-scale/jquery) 
- [Rating API documentation](https://surveyjs.io/form-library/documentation/api-reference/rating-scale-question-model)

#### ranking

The ranking question allows participants to arrange a set of choices in order of preference, importance, or other criteria, or assign a numerical value to each choice based on their relative rank. The options are displayed vertically, and participants can drag-and-drop to change their order.
This question type can be useful when used with the SurveyJS "carry forward" feature. For instance, you can take the participant's responses from a previous checkbox (multi-select) question and use those selections as the options to rank in a ranking question (see the `reference_previous_answers.html` example in the jsPsych survey package). It's also possible to combine the selection and ranking steps into a single question using the ['select items to rank'](https://surveyjs.io/form-library/examples/select-items-to-rank/jquery) approach, which allows participants to 'select' items by dragging them into a separate ranking area, and re-order the items in the ranking area.

- [Ranking example](https://surveyjs.io/form-library/documentation/api-reference/ranking-question-model) 
- [Ranking API documentation](https://surveyjs.io/form-library/documentation/api-reference/ranking-question-model)

#### signaturepad

The signaturepad question allows participants to add their digital signature to the survey by drawing with the mouse or finger (on a trackpad or touchscreen-enabled device). You can specify the pen color and box size, and save the signature as Base64-encoded text in PNG (default), JPEG, or SVG format. You can also save the image directly to a server rather than encoding it as text with the rest of the response data. See this [SurveyJS demo and documentation](https://surveyjs.io/form-library/examples/upload-signature-pad-data-to-server/jquery#content-code) about uploading the signature as an image file, and the [file question](#file) for more information and warnings about handling files.

- [Signaturepad example](https://surveyjs.io/form-library/examples/signature-pad-widget-javascript/jquery)
- [Signaturepad API documentation](https://surveyjs.io/form-library/documentation/api-reference/signature-pad-model)

#### text 

In addition to a basic text input box, you can select from any of these other input types: **color, date, datetime-local, email, month, number, password, range, tel, time, url, week**. Setting these input types will change things like (1) the format of the response elements, (2) the characters/values that the participant is allowed to enter, and/or (3) add automatic validation for the response format.

- [Text input examples](https://surveyjs.io/form-library/examples/text-entry-question/jquery) - includes email, password, and URL input types
- [Date/time input examples](https://surveyjs.io/form-library/examples/datetime-entry-question/jquery)
- [Numeric input examples](https://surveyjs.io/form-library/examples/numeric-entry-question/jquery) - includes range input (slider) and telephone number input types
- [Color input example](https://surveyjs.io/form-library/examples/color-input-question/jquery)
- [Text API documentation](https://surveyjs.io/form-library/documentation/api-reference/text-entry-question-model)

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response to each question. The object will have a separate key (identifier) for each question. If the `name` parameter is defined for the question (recommended), then the response object will use the value of `name` as the key for each question. If any questions do not have a name parameter, their keys will named automatically, with the first unnamed question recorded as `question1`, the second as `question2`, and so on. The response type will depend on the question type. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. |

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## CSS

This plugin requires an additional stylesheet called `survey.css`. You can load it via: 

```html
<link rel="stylesheet" href="https://unpkg.com/@jspsych/plugin-survey@1.0.1/css/survey.css">
```

If you are using a bundler such as [webpack](https://webpack.js.org/), you can also import it in JavaScript as follows, depending on your bundler configuration:
```javascript
import '@jspsych/plugin-survey/css/survey.css'
```

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-survey@1.0.1"></script>
<link rel="stylesheet" href="https://unpkg.com/@jspsych/plugin-survey@1.0.1/css/survey.css">
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey.js"></script>
<link rel="stylesheet" href="jspsych/plugin-survey.css">
```

Using NPM:

```
npm install @jspsych/plugin-survey
```
```js
import survey from '@jspsych/plugin-survey';
import '@jspsych/plugin-survey/css/survey.css'
```

## Examples

???+ example "Single page with radiogroup (multiple choice) and checkbox"
    === "Code"

        ```javascript
        const trial = {
          type: jsPsychSurvey,
          survey_json: {
            showQuestionNumbers: false,
            elements:
              [
                {
                  type: 'radiogroup',
                  title: "Which of the following do you like the most?", 
                  name: 'vegetablesLike', 
                  choices: ['Tomato', 'Cucumber', 'Eggplant', 'Corn', 'Peas', 'Broccoli']
                }, 
                {
                  type: 'checkbox',
                  title: "Which of the following do you like?", 
                  name: 'fruitLike', 
                  description: "You can select as many as you want.",
                  choices: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Kiwi', 'Mango'], 
                  showOtherItem: true,
                  showSelectAllItem: true,
                  showNoneItem: true,
                  required: true,
                }
            ]
          }
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo1.html">Open demo in new tab</a>

??? example "Multiple pages with text and multiple choice questions, and more customization"
    === "Code"

        ```javascript
        const trial = {
          type: jsPsychSurvey,
          survey_json: {
            showQuestionNumbers: false,
            title: 'My questionnaire',
            completeText: 'Done!',
            pageNextText: 'Continue',
            pagePrevText: 'Previous',
            pages: [
              {
                name: 'page1',
                elements: [
                    {
                      type: 'text',
                      title: 'Where were you born?', 
                      placeholder: 'City, State/Region, Country',
                      name: 'birthplace', 
                      size: 30,
                      isRequired: true,
                    }, 
                    {
                      type: 'text',
                      title: 'How old are you?', 
                      name: 'age', 
                      isRequired: false,
                      inputType: 'number',
                      min: 0,
                      max: 100,
                      defaultValue: 0
                    }
                  ]
              },
              {
                name: 'page2',
                elements: [
                  {
                    type: 'radiogroup',
                    title: "What's your favorite color?", 
                    choices: ['Blue','Yellow','Pink','Teal','Orange','Lime green'],
                    showNoneItem: true,
                    showOtherItem: true,
                    colCount: 0,
                    name: 'FavColor',
                  }, 
                  {
                    type: 'checkbox',
                    title: 'Which of these animals do you like? Select all that apply.', 
                    choices: ['Lion','Squirrel','Badger','Whale', 'Turtle'],
                    choicesOrder: 'random',
                    colCount: 0,
                    name: 'FavAnimals', 
                  }
                ]
              }
            ]
          }
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo2.html">Open demo in new tab</a>

??? example "Rating and matrix questions for Likert-style scales"
    This example shows several different options for presenting a single question/statement with a rating scale (buttons,  stars, smileys). It also shows a table of several questions/statements (rows) to be rated on the same scale (columns).
    **Note:** This content requires more page width and is best viewed when opened in a new tab.
    === "Code"

        ```javascript
        const trial = {
          type: jsPsychSurvey,
          survey_json: {
            showQuestionNumbers: false,
            title: 'Likert scale examples',
            pages: [
              {
                elements: [
                  {
                    type: 'rating',
                    name: 'like-vegetables',
                    title: 'I like to eat vegetables.',
                    description: 'Button rating scale with min/max descriptions',
                    minRateDescription: 'Strongly Disagree',
                    maxRateDescription: 'Strongly Agree',
                    displayMode: 'buttons',
                    rateValues: [1,2,3,4,5]
                  }, 
                  {
                    type: 'rating',
                    name: 'like-cake',
                    title: 'I like to eat cake.',
                    description: 'Star rating scale with min/max descriptions',
                    minRateDescription: 'Strongly Disagree',
                    maxRateDescription: 'Strongly Agree',
                    rateType: 'stars',
                    rateCount: 10,
                    rateMax: 10,
                  },
                  {
                    type: 'rating',
                    name: 'like-cooking',
                    title: 'How much do you enjoy cooking?',
                    description: 'Smiley rating scale without min/max descriptions',
                    rateType: 'smileys',
                    rateCount: 10,
                    rateMax: 10,
                    scaleColorMode: 'colored',
                  }
                ]
              }, {
                elements: [
                  {
                    type: 'matrix',
                    name: 'like-food-matrix',
                    title: 'Matrix question for rating mutliple statements on the same scale.',
                    alternateRows: true,
                    isAllRowRequired: true,
                    rows: [
                      {text: 'I like to eat vegetables.', value: 'VeggiesTable'},
                      {text: 'I like to eat fruit.', value: 'FruitTable'},
                      {text: 'I like to eat cake.', value: 'CakeTable'},
                      {text: 'I like to cook.', value: 'CookTable'},
                    ],
                    columns: [{
                      "value": 5,
                      "text": "Strongly agree"
                    }, {
                      "value": 4,
                      "text": "Agree"
                    }, {
                      "value": 3,
                      "text": "Neutral"
                    }, {
                      "value": 2,
                      "text": "Disagree"
                    }, {
                      "value": 1,
                      "text": "Strongly disagree"
                    }]
                  }
                ]
              }
            ]
          }
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo3.html">Open demo in new tab</a>

??? example "Conditional question visibility based on response"
    This example demonstrates how you can show/hide questions based on the participant's response. It also shows how you can show/hide the navigation buttons and move on to the next page automatically.
    === "Code"

        ```javascript
        const survey_function = (survey) => {
          // If it's the question page, then hide the buttons and move on automatically.
          // If it's the feedback page, then show the navigation buttons.
          function updateNavButtons(sender, options) {
            if (options.newCurrentPage.getPropertyValue("name") === "feedback") {
              survey.showNavigationButtons = "bottom";
            } else {
              survey.showNavigationButtons = "none";
            }
          }
          survey.onCurrentPageChanging.add(updateNavButtons);
        }

        const trial = {
          type: jsPsychSurvey,
          survey_json: {
            showQuestionNumbers: false,
            title: 'Conditional question visibility.',
            showNavigationButtons: "none",
            goNextPageAutomatic: true,
            allowCompleteSurveyAutomatic: true,
            pages: [{
              name: 'question',
              elements: [
                {
                  type: 'radiogroup',
                  title: 'During the experiment, are you allowed to write things down on paper to help you?',
                  choices: ["Yes", "No"],
                  name: "WriteOK",
                  isRequired: true
                }
              ],
            }, {
              name: 'feedback',
              elements: [
                {
                  type: 'html',
                  name: 'incorrect',
                  visibleIf: '{WriteOK} = "Yes"',
                  html: '<h4>That response was incorrect.</h4><p>Please return to the previous page and try again.</p>'
                },
                {
                  type: 'html',
                  name: 'correct',
                  visibleIf: '{WriteOK} == "No"',
                  html: '<h4>Congratulations!</h4>'
                }
              ]
            }]
          },
          survey_function: survey_function
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo4.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo4.html">Open demo in new tab</a>

??? example "Repeating survey trials with different variables"
    The survey plugin is not well-suited for use with the jsPsych timeline variables feature, so an alternative to creating a set of repeating survey trials is to construct them in a loop.
    When adding any data to a survey trial, you should add it via the `data` parameter at the whole-trial level (not inside the question objects), even if it only relates to one question out of multiple questions/pages contained within the trial.
    === "Code"

        ```javascript
        // values that change across survey trials - each object represents a single trial
        const question_variables = [
          {
            'fruit': 'apples',
            'Q1_prompt': 'Do you like apples?', 
            'Q1_type': 'regular',
            'Q2_word': 'like'
          },
          {
            'fruit': 'pears',
            'Q1_prompt': 'Do you like pears?', 
            'Q1_type': 'regular',
            'Q2_word': 'like'
          },
          {
            'fruit': 'bananas',
            'Q1_prompt': 'Do you NOT like bananas?', 
            'Q1_type': 'reverse',
            'Q2_word': 'hate'
          },
        ];

        // create an array to store all of our survey trials so that we can easily randomize their order
        survey_trials = [];

        // construct the survey trials dynamically using an array of question-specific information
        for (let i=0; i<question_variables.length; i++) {

          // set up the survey JSON for this trial
          // any question-specific variables come from the appropriate object in the question_variables array
          let survey_json = {
            showQuestionNumbers: false,
            title: 'Dynamically constructing survey trials.',
            completeText: 'Next >>',
            elements: [
              {
                type: 'radiogroup',
                title: question_variables[i].Q1_prompt,
                choices: ['Yes', 'No'],
                name: 'Q1'
              },
              {
                type: 'text',
                title: 'What do you '+question_variables[i].Q2_word+' most about '+question_variables[i].fruit+'?',
                name: 'Q2'
              }
            ]
          };
          
          // set up a survey trial object using the JSON we've just created for this question, 
          // and add the trial object to the survey trials array
          survey_trials.push({
            type: jsPsychSurvey,
            survey_json: survey_json,
            data: {
              'Q1_prompt': question_variables[i].Q1_prompt,
              'Q1_type': question_variables[i].Q1_type,
              'Q2_word': question_variables[i].Q2_word,
              'fruit': question_variables[i].fruit                                                        
            }  
          });

        }

        const timeline = jsPsych.randomization.shuffle(survey_trials);
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo5.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo5.html">Open demo in new tab</a>


??? example "Adding images, sound and HTML"
    This example shows how to add HTML, image and audio elements to a survey. It also demonstrates some CSS customization and response validation.
    === "Code"

        ```css
        /* center the audio player and all image question types in the survey */
        div.sd-question--image, div.sd-question[data-name="audio-player"] {
          text-align: center;
        }
        /* use 'data-name' to select any specific question by name */
        div[data-name="audio-response"] {
          text-align: center;
          margin-top: 30px;
        }
        ```

        ```javascript
        // Embed HTML, images, videos and audio into the survey
        const image_video_html_trial_info = {
          pages: [{
            elements: [{
              type: "panel",
              name: "html-img-panel",
              description: "This panel contains an HTML element and an image element.",
              elements: [{
                type: "html",
                name: "html",
                html: "<div style='text-align: center; align-items: center; align-content: center; justify-content: center;'><p style='text-align: center; color: darkgreen; font-size: 2em;'>This demo shows how you can add <em>HTML</em>, <strong>images</strong>, and <sub>video</sub> to your jsPsych survey trial.</p></div>"
              }, {
                type: "image",
                name: "monkey",
                imageLink: "img/monkey.png",
                altText: "Monkey",
                imageWidth: 300
              }]
            }, {
              type: "panel",
              name: "video-panel",
              description: "This panel contains a fun fish video.",
              elements: [{
                type: "image",
                name: "jspsych-tutorial",
                imageLink: "video/fish.mp4",
                imageWidth: 700,
                imageHeight: 350
              }],
            }]
          }],
          widthMode: "static",
          width: 900,
          completeText: 'Next'
        };

        const image_video_html_trial = {
          type: jsPsychSurvey,
          survey_json: image_video_html_trial_info
        };

        // Using images as response options
        const image_choice_trial_info = {
          elements: [{
            type: "imagepicker",
            name: "animals",
            title: "Which animals would you like to see in real life?",
            description: "Please select all that apply.",
            choices: [{
              value: "lion",
              imageLink: "img/lion.png",
              text: "Lion"
            }, {
              value: "monkey",
              imageLink: "img/monkey.png",
              text: "Monkey"
            }, {
              value: "elephant",
              imageLink: "img/elephant.png",
              text: "Elephant"
            }],
            showLabel: true,
            multiSelect: true
          }],
          showQuestionNumbers: "off",
          completeText: 'Next',
        };

        const image_choice_trial = {
          type: jsPsychSurvey,
          survey_json: image_choice_trial_info
        };

        // Add sound to an HTML element
        // This also demonstrates response validation
        const sound_trial_info = {
          elements: [{
            type: "html",
            name: "audio-player",
            html: "<audio controls><source src='sound/speech_red.mp3' type='audio/mp3'></audio>"
          },
          {
            type: "text",
            name: "audio-response",
            title: "Please play the sound above and then type the word that you heard in the box below.",
            description: "Try getting it wrong to see the response validation.",
            required: true,
            validators: [{
              type: "regex",
              text: "Oops, that's not correct. Try again!",
              regex: "[rR]{1}[eE]{1}[dD]{1}"
            }],
          }],
          completeText: "Check my response",
          showQuestionNumbers: "off"
        };

        const sound_trial = {
          type: jsPsychSurvey,
          survey_json: sound_trial_info
        }

        const timeline = [image_video_html_trial, image_choice_trial, sound_trial];
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo6.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo6.html">Open demo in new tab</a>


??? example "Automatic formating for text input"
    You can add automatic formatting, or input masking, to a text entry question. See the SurveyJS documentation on masked input fields for more information and examples.
    === "Code"

        ```javascript
        const timeline = [];
        
        const text_masking_json = {
          elements: [
            {
              type: "html",
              name: "intro",
              html: "<h3>Input masking examples</h3><p>You can use input masking with text questions to add automatic formatting to the participant's answer. The mask types are: currency, decimal, pattern, and datetime. These masks will also restrict the types of characters that can be entered, e.g. only numbers or letters."
            },
            {
              type: "text",
              name: "currency",
              title: "Currency:",
              description: "This currency mask adds a prefix/suffix to the number to indicate the currency. Enter some numbers to see the result.",
              maskType: "currency",
              maskSettings: {
                prefix: "$",
                suffix: " USD"
              }
            },
            {
              type: "text",
              name: "decimal",
              title: "Decimal:",
              description: "This numeric mask will specify the number of decimals allowed. You can enter numbers with up to three decimals (precision: 3).",
              maskType: "numeric",
              maskSettings: {
                precision: 3
              }
            },
            {
              type: "text",
              name: "phone",
              title: "Phone:",
              description: "This pattern mask will format the numbers as a phone number.",
              maskType: "pattern",
              maskSettings: {
                pattern: "+9 (999)-999-9999"
              }
            },
            {
              type: "text",
              name: "creditcard",
              title: "Credit card number:",
              description: "This pattern mask will format the numbers as a credit card number.",
              maskType: "pattern",
              maskSettings: {
                pattern: "9999 9999 9999 9999"
              }
            },
            {
              type: "text",
              name: "licenseplate",
              title: "License plate number:",
              description: "A pattern mask can also be used with letters. Enter a license plate number in the format ABC-1234.",
              maskType: "pattern",
              maskSettings: {
                pattern: "aaa-9999"
              }
            }
          ],
          showQuestionNumbers: false
        };

        timeline.push({
          type: jsPsychSurvey,
          survey_json: text_masking_json
        });
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-demo7.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-demo7.html">Open demo in new tab</a>