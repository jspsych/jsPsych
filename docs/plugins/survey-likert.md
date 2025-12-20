# survey-likert

Current version: 2.1.0. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-survey-likert/CHANGELOG.md).

The survey-likert plugin displays a set of questions with Likert scale responses. The participant responds by selecting a radio button. Furthermore, this plugin can also be used to collect responses on image impressions using the SD method.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, labels and required parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value is *undefined*. The strings are the question that will be associated with a slider. `labels`: Type array, default value is *undefined*. Each array element is an array of strings. The innermost arrays contain a set of labels to display for an individual question. If you want to use blank responses and only label the end points or some subset of the options, just insert a blank string for the unlabeled responses.`required`: Type boolean, default value is false. Makes answering questions required. `name`: Name of the question. Used for storing data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions. `left_anchor`: The string displayed at the left end in the SD method. `right_anchor`: The string displayed at the right end in the SD method.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
scale_width | numeric | null | The width of the likert scale in pixels. If left `null`, then the width of the scale will be equal to the width of the widest content on the page.
button_label | string |  'Continue' | Label of the button.
autocomplete | boolean | false | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to true will enable autocomplete or auto-fill for the form.
stimulus | string | null | The file name of the image. When using the SD method, it will be displayed on the left side of the screen. This image is not automatically preloaded, but this should not be an issue for most surveys. If preloading is necessary, please use [the preload plugin](./preload.md) together.
image_caption | string | null | The string displayed below the image.
image_width | numeric | 500 | The width of the image. If it differs from the actual width, the image will be scaled up or down while maintaining its aspect ratio.
scale_area_height | numeric | 300 | The height of the area where the scale is displayed when an image is presented. If there are many question items, a scrollbar will appear. The position of the image remains fixed.
left_anchor_width | numeric | 200 | The width of the left anchor.
right_anchor_width | numeric | 200 | The width of the right anchor.
line_position | numeric | 20 | A numeric value used to adjust the vertical position of anchors so they align with the horizontal line.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position selected on the likert scale for that question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. |
question_order | array | An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
stimulus | string | The path of the image that was displayed.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-survey-likert@2.1.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey-likert.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-survey-likert
```
```js
import surveyLikert from '@jspsych/plugin-survey-likert';
```

## Examples

???+ example "Single Question"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyLikert,
          questions: [
            {
              prompt: "I like vegetables.", 
              labels: [
                "Strongly Disagree", 
                "Disagree", 
                "Neutral", 
                "Agree", 
                "Strongly Agree"
              ]
            }
          ]
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-likert-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-likert-demo1.html">Open demo in new tab</a>

???+ example "Multiple questions in a random order"
    === "Code"

        ```javascript
        var likert_scale = [
          "Strongly Disagree", 
          "Disagree", 
          "Neutral", 
          "Agree", 
          "Strongly Agree"
        ];

        var trial = {
          type: jsPsychSurveyLikert,
          questions: [
            {prompt: "I like vegetables.", name: 'Vegetables', labels: likert_scale},
            {prompt: "I like fruit.", name: 'Fruit', labels: likert_scale},
            {prompt: "I like meat.", name: 'Meat', labels: likert_scale},
          ],
          randomize_question_order: true
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-likert-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-likert-demo2.html">Open demo in new tab</a>

???+ example "SD method"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyLikert,
          stimulus: "img/happy_face_1.jpg",
          preamble: "PREAMBLE",
          image_caption: "CAPTION",
          questions: [
            {
              prompt: "How friendly or unfriendly does this person appear to you?",
              left_anchor: "Friendly",
              right_anchor: "Unfriendly", 
              name: 'Friendly', 
              labels: scale, 
              required: true
            },
            {
              prompt: "How trustworthy or untrustworthy does this person seem?", 
              left_anchor: "Trustworthy",
              right_anchor: "Untrustworthy", 
              name: 'Trustworthy', 
              labels: scale, 
              required: true
            },
            {
              prompt: "How attractive or unattractive do you find this person?", 
              left_anchor: "Attractive",
              right_anchor: "Unattractive", 
              name: 'Attractive', 
              labels: scale, 
              required: true
            }
          ]
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-likert-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-likert-demo3.html">Open demo in new tab</a>
    
