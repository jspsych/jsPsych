# Building Surveys in jsPsych

## Choosing which jsPsych survey plugin to use

jsPsych has several plugins that allow you to present survey questions during your experiment. The one you choose will depend on what exactly you'd like to do, and your preferences for convenience/parameterization versus flexibility.

* Survey-* plugins: [`survey-likert`](../plugins/survey-likert.md), [`survey-multi-choice`](../plugins/survey-multi-choice.md), [`survey-multi-select`](../plugins/survey-multi-select.md), [`survey-text`](../plugins/survey-text.md)
    * Only one question type and one page per trial
    * Parameterization makes it easy to define questions
    * Work well with [timeline variables](timeline.md#timeline-variables)
    * Ideal for adding survey-style questions into repetitive trial procedures
    * Limited functionality and customization options
* [`survey-html-form`](../plugins/survey-html-form.md) plugin
    * Can mix different question types on the same page
    * No parameters for defining questions - you write the form HTML
    * Maximally flexible, so ideal if you need a lot of control over the survey content and style
* [`survey`](../plugins/survey.md) plugin
    * Not well-suited for use with [timeline variables](timeline.md#timeline-variables)
    * Large set of built-in question types and parameterized customization options
    * Can mix different question types on the same page
    * Can present mutliple pages that participants can navigate back and forth through, without losing responses
    * Parameters for defining questions, but more config/code than the `survey-*` plugins
    * Built-in convenience parameters for many survey question types and features (e.g. response validation, conditional question display, 'other'/'none'/'select all' options)

The [`survey` plugin](../plugins/survey.md) differs from most other jsPsych plugins in that is a simple wrapper for an external JavaScript library called SurveyJS. This allows jsPsych users to take advantage of all of the SurveyJS features, documentation, and example code, but it also means that the `survey` plugin does not follow the same familiar conventions as most other jsPsych plugins. Users will need to familiarize themselves somewhat with the SurveyJS library in order to use the plugin. The remaining documentation on this page provides some guidance for getting started with SurveyJS and the jsPsych `survey` plugin.

## Getting started with SurveyJS

The [SurveyJS form library](https://surveyjs.io/form-library/documentation/overview) is a large and powerful survey-building framework with its own helpful documentation, examples, and demos. Here we have tried to orient jsPsych users to the basic steps for constructing surveys and highlight the features that jsPsych users may find most useful. However, it is not possible for us to reproduce the SurveyJS documentation here, so we encourage you to take advantage of their comprehensive documentation and demo/code examples.

SurveyJS allows you to build surveys using a JavaScript/JSON object, a JavaScript function, or a combination of both. You can read more about these options in the SurveyJS documentation:

- [Define a survey in JSON](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json)
- [Define a survey with JavaScript](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically)

The jsPsych `survey` plugin provides the `survey_json` and `survey_function` parameters to allow you to construct a SurveyJS survey using these JSON and JavaScript methods. The next two sections on this page explain more about each method: [Creating a survey with JSON](#creating-a-survey-with-json) and [Using JavaScript to create or modify the survey](#using-javascript-to-create-or-modify-the-survey).

Here are some other places to start learning about SurveyJS:

- [Add multiple pages to a survey](https://surveyjs.io/form-library/documentation/design-survey/create-a-multi-page-survey#add-multiple-pages-to-a-survey)
- [Configure conditional page visibility](https://surveyjs.io/form-library/documentation/design-survey/create-a-multi-page-survey#configure-page-visibility)
- [Page navigation UI](https://surveyjs.io/form-library/documentation/design-survey/create-a-multi-page-survey#page-navigation-ui) (previous, next, and submit buttons)
- [Add conditional logic and dynamic texts](https://surveyjs.io/form-library/documentation/design-survey/conditional-logic)
- [Set default values](https://surveyjs.io/form-library/documentation/design-survey/pre-populate-form-fields#default-question-values)

SurveyJS has some more specific features that some researchers might find useful, including:

- [Automatic question numbering](https://surveyjs.io/form-library/examples/how-to-number-pages-and-questions/jquery) (across the survey, within each page, and using custom values/characters)
- [Response validation](https://surveyjs.io/form-library/examples/javascript-form-validation/jquery)
- [Table of contents and navigation across sections](https://surveyjs.io/form-library/examples/table-of-contents/jquery)
- [Progress bar](https://surveyjs.io/form-library/examples/configure-form-navigation-with-progress-indicators/jquery)
- [Carry responses forward from a selection question](https://surveyjs.io/form-library/examples/carry-forward-responses/jquery)
- [Carry responses forward from a dynamic matrix/panel](https://surveyjs.io/form-library/examples/pipe-answers-from-dynamic-matrix-or-panel/jquery)
- [Conditional visibility for elements/questions](https://surveyjs.io/form-library/documentation/design-survey/conditional-logic#conditional-visibility) (see also [this example](https://surveyjs.io/form-library/examples/implement-conditional-logic-to-change-question-visibility/jquery))
- Special choices for multi-choice-type questions: [None](https://surveyjs.io/form-library/documentation/api-reference/radio-button-question-model#showNoneItem), [Other](https://surveyjs.io/form-library/documentation/api-reference/radio-button-question-model#showOtherItem), [Select All](https://surveyjs.io/form-library/documentation/api-reference/checkbox-question-model#showSelectAllItem), [Refuse to answer](https://surveyjs.io/form-library/documentation/api-reference/radio-button-question-model#showRefuseItem), and [Don't know](https://surveyjs.io/form-library/documentation/api-reference/radio-button-question-model#showDontKnowItem)
- [Localization](https://surveyjs.io/form-library/examples/survey-localization/jquery) (adapting the survey's language based on a country/region value)
- [Text piping](https://surveyjs.io/form-library/examples/text-piping-in-surveys/jquery) (dynamically insert text into questions/answers based on previous responses)

You can find realistic examples on the [SurveyJS examples/demos page](https://surveyjs.io/form-library/examples/overview). And to view all of the survey-level options, see the [Survey API documentation](https://surveyjs.io/form-library/documentation/api-reference/survey-data-model).

### Creating a survey with JSON

SurveyJS allows you to define the survey contents using an object with parameters names and values. At a minimum, the survey JSON object should contain a property called 'elements'. The value of 'elements' is an array that contains at least one element/question to be shown on the page.

```javascript
// Survey with a single text entry question.
const survey_json = {
  elements: [{
    name: "example",
    title: "Enter some text in the box below!",
    type: "text"
  }]
};
```

Each element is an object with a 'type', which is the element/question type (see the `survey` plugin's [Questions/Elements section](../plugins/survey.md#questionelement-types) for a list of type options). The element objects should also contain any other parameters and configuration options for that question, such as the question name (used to identify the question in the data), title (prompt shown to the participant), whether or not a response is required, and other parameters that might be relevant to that particular question type. The [Questions/Elements section](../plugins/survey.md#questionelement-types) in the `survey` plugin documentation contains links to the SurveyJS documentation for each question type, where you can find more information about the required and optional parameters.

Once you've created the survey JSON object, as we've done above, it can be used as the `survey_json` parameter in a jsPsych `survey` trial:

```javascript
const survey_trial = {
  type: jsPsychSurvey,
  survey_json: survey_json
};

timeline.push(survey_trial);
```

That's it! The code above will create a valid survey.

!!! note "JSON vs JavaScript objects"

    [JSON (JavaScript Object Notation)](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) is a text format for organizing data. It is very similar to a JavaScript object, but not exactly the same. The `survey_json` parameter takes a JSON-compatible JavaScript object, rather than a JSON string. We use the 'JSON' term for this parameter to make it clear that this parameter should not contain functions, and for consistency with SurveyJS documentation. To read more about JSON vs JavaScript objects, see e.g. [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#javascript_and_json_differences) and [here](https://www.w3schools.com/js/js_json_intro.asp).


#### Multiple pages

You can specify 'elements' as a top-level property in the survey JSON, and those elements will be shown on a single page. If you'd like the survey to have more than one page, then you can add a 'pages' property to the survey JSON object. The value of 'pages' should be an array of objects, where each object defines a single page. Each page object should contain its own 'elements' array. 

The example below defines a survey with two pages. Each page has a set of elements/questions, as well as some optional parameters (page name and title).

```javascript
const survey_json = {
  pages: [
  {
    name: "page_1",
    title: "Your Name",
    elements: [{
      type: "text",
      name: "first_name",
      title: "Enter your first name:"
    }, {
      type: "text",
      name: "last_name",
      title: "Enter your last name:"
    }
  }, {
    name: "page_2",
    title: "Personal Information",
    elements: [{
      type: "text",
      name: "location",
      title: "Where do you live?"
    }, {
      type: "text",
      name: "occupation",
      title: "What is your occupation?"
    }, {
      type: "text",
      name: "age",
      title: "How old are you?",
      inputType: "number",
      min: 0,
      max: 120
    }
  }]
};
```

#### Survey-level options

Along with either the 'elements' or 'pages' property, you can add optional survey-level properties to the top-level of your survey JSON object. The survey-level properties might include things like: a title (shown at the top of each page), whether to use automatic question numbering, labels for the page navigation buttons, and text to use for marking required questions. These and other survey-level parameters are not required - you only need to set these values if you want to change them from the defaults.

```javascript
const survey_json = {
  title: "Survey title",
  showQuestionNumbers: "off",
  completeText: "Done",
  pageNextText: "Next",
  pagePrevText: "Back",
  requiredText: "[REQUIRED]",
  pages: [{
    elements: {
      // ... page 1 questions
    }
  }, {
    elements: {
      // ... page 2 questions
    }
  }]
};
```

Some of the survey-level options can also be set a the page level. See the [Page API documentation](https://surveyjs.io/form-library/documentation/api-reference/page-model) for more information.

For more survey JSON examples, see the [SurveyJS JSON documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json), the [Examples](../plugins/survey.md#examples) section on the `survey` plugin documentation page, and the [examples folder](https://github.com/jspsych/jsPsych/tree/main/packages/plugin-survey) in the `survey` plugin package.


### Using JavaScript to create or modify the survey

SurveyJS allows you to create or modify your survey using JavaScript. The JavaScript approach can do any of the configuration that can be done in JSON, plus it allows you to make your survey more dynamic. For instance, you could use the survey function parameter to change the contents of the survey based on the participant's earlier responses. The survey function parameter also allows you to define any other functions that should run during the survey. For instance, you might want to run custom code in response to a page change or response input event.

In the jsPsych `survey` plugin, the `survey_function` parameter receives a 'survey' argument, which is a SurveyJS survey model that you can manipulate. If you do not include a value for the `survey_json` parameter, then the `survey_function` will receive an empty survey. In this case, your `survey_function` must add at least one page with at least one element/question to produce a valid survey.

Here's the JavaScript function that would create the same survey that's defined in the first JSON example above:

```javascript
const survey_function = (survey) => {
  // add page
  const page = survey.addNewPage("page1");
  // add question
  const text_question = page.addNewQuestion("text", "example");
  text_question.title = "Enter some text in the box below!";
};

const survey_trial = {
  type: jsPsychSurvey,
  survey_function: survey_function
};

timeline.push(survey_trial);
```

### Combining JSON and function parameters

If you specify survey JSON using the `survey_json` parameter, then the `survey_function` will receive a survey object that was created using your JSON. This means that, in your survey function, you can access all of the survey elements that you have defined in the JSON.

Here's a slightly more realistic case for when you might want to use the `survey_function` parameter. In this example, we want to ask the participant to make a color choice at the start of the experiment, and then reference their choice in a later `survey` trial question. We can't do this with the JSON configuration because we cannot know the participant's color choice in advance - it only becomes available during the experiment. 

However, we can use the `survey_function` to dynamically access the participant's color response from the jsPsych data and use that value in the survey question title. We'll use the `survey_function` just for this one dynamic part of the survey, and define everything else in JSON.

```javascript
// Create an array of color choices
const color_choices = ['red', 'green', 'blue', 'yellow', 'pink', 'orange', 'purple'];

// Create an html-button-response trial where the participant can choose a color
const select_color_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Which of these is your favorite color?</p>',
  choices: color_choices,
  button_html: '<button class="jspsych-btn" style="color:%choice%";">%choice%</button>',
  data: {trial_id: 'color_trial'}
};

// Create the survey JSON 
const color_survey_json = {
  elements: [{
    type: "boolean",
    renderAs: "radio",
    name: "color_confirmation",
    title: "" // This value will be set in the survey function
  }]
};

// Create a survey function to access the participant's response 
// from an earlier trial and modify the survey accordingly
const color_survey_function = (survey) => {
  // Get the earlier color selection response (button index) from the jsPsych data
  const color_choice_index = jsPsych.data.get().filter({trial_id: 'color_trial'}).values()[0].response;
  const color_choice = color_choices[color_choice_index];
  // Get the question that we want to modify
  const color_confirmation_question = survey.getQuestionByName('color_confirmation');
  // Change the question title to include the name of the color that was selected
  color_confirmation_question.title = `
    Earlier you chose ${color_choice.toUpperCase()}. Do you still like that color?
  `;
}

// Create the jsPsych survey trial using both the survey JSON and survey function
const color_survey_trial = {
  type: jsPsychSurvey,
  survey_json: color_survey_json,
  survey_function: color_survey_function
};

jsPsych.run([select_color_trial, color_survey_trial]);
```

For more information about creating/modifying surveys with JavaScript, see the [SurveyJS documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically). The SurveyJS API reference contains all of the properties (parameters), methods, and events you can use when working with the survey, page, and question objects.

### Deciding between JSON and function parameters

You can create `survey` trials entirely with JSON, entirely with a JavaScript function, or using a combination of both. Sometimes this is just a matter of preference. But you must use the JavaScript `survey_function` method when you want to:

- Dynamically modify the survey based on a participant's response from an earlier trial, or any other information you don't have access to before the survey trial begins.
- Use custom functions as part of your survey's configuration. For instance, you might want to write a function that is triggered by a particular survey event, such as when response values change or when the survey is completed. You cannot put JavaScript functions into the `survey_json` object, so you will need to add them using the `survey_function` parameter.

!!! note "Custom response validation"
    There is a special case where you don't need to use the `survey_function` parameter for running a custom function, which is for adding custom response validation. The `survey` plugin includes a convenience parameter called `validation_function`, which allows you to add some custom JavaScript code to validate responses. Of course, you can also use the `survey_function` parameter for this, in which case you would set your custom function to run in response to the survey's [`onValidateQuestion`](https://surveyjs.io/form-library/documentation/api-reference/survey-data-model#onValidateQuestion) event.

### Creating dynamic surveys with JSON

Although you cannot include JavaScript functions as values in your `survey_json`, SurveyJS has implemented some convenience options for setting up certain kinds of dynamic survey behavior from within the JSON configuration. For instance, you can define a condition expression from within the JSON that will dynamically show/hide a question or choice/column/row (see [Conditional Visibility](https://surveyjs.io/form-library/documentation/design-survey/conditional-logic#conditional-visibility) and [Expressions](https://surveyjs.io/form-library/documentation/design-survey/conditional-logic#expressions)). As another example, you can use a placeholder value inside a text string to insert the response from a particular question into that string (see [Dynamic Texts: Question Values](https://surveyjs.io/form-library/documentation/design-survey/conditional-logic#question-values)).

In general, you can access information in the survey JSON that exists *within that same `survey` trial* and use it to produce dynamic behavior (e.g. putting placeholder values in text strings, automatically populating choice values, etc.). But if you need to access information that becomes available during the experiment but *outside of that particular `survey` trial*, you will need to use the `survey_function` parameter. 

### Defining survey trials/questions programmatically

Sometimes it's useful to be able to create your survey content programmatically. For instance, let's say you want to present a page with questions that all use the exact same format but with different prompts. You _could_ define them one-by-one in a `survey_json` object, but doing it this way might produce a very large JSON object with lots of repeated configuration across all questions. 

Instead, it's often preferrable to separate the information that changes across questions from the things that stay the same. This can make it easier to make changes and prevent errors, since the things that are common across questions only need to be defined once. Similarly, if you are repeating a trial procedure lots of times, then you might want to define a single `survey` trial that repeats with slightly different parameters. 

The following section presents some different options for programmatically defining multiple questions in a survey trial, or multiple survey trials, based on an array of values that should change across questions or trials.

The example below shows how to use the `survey_function` to loop over a set of question-level variables (titles/prompts and names), and dynamically add each question to a single survey page. You could use this same approach to add questions across multiple pages within the same survey trial.

```javascript
const survey_function = (survey) => {

  // this array stores any information that changes across questions
  const questions = [
    {title: "Question 1", name: "q1"},
    {title: "Question 2", name: "q2"},
    // ... more question-level variables ...
    {title: "Question N", name: "qN"}
  ];

  // create a single page
  const page = survey.addNewPage("questions");

  for (let i=0; i<questions.length; i++) {
    // for each object in the questions array,
    // create a new question and add it to the same page
    let q = page.addNewQuestion("text", questions[i].name, i);
    q.title = questions[i].title;
    q.inputType = "range";
    q.min = 0;
    q.max = 100;
    q.step = 10;
    q.defaultValue = 50;
    q.isRequired = true;
  }

}
```

!!! tip "Use the 'matrix' question type for repeated response options"
    The example above was used to illustrate how you can loop over information to programmatically construct a series of questions that are shown on the same page. But in cases where you have different question prompts that all use the same multiple choice options, you might prefer to use the the SurveyJS ["matrix" question type](https://surveyjs.io/form-library/examples/single-selection-matrix-table-question/jquery). This question type creates a table where each row is a question and each column is a response option. The table format is often used for Likert scales, satisfaction surveys, etc. You can even create a table that repeats a set of questions with different response types using the SurveyJS [multi-select matrix](https://surveyjs.io/form-library/examples/multi-select-matrix-question/jquery#) ("matrixdropdown") question type.


Rather than repeating a question format within the same trial, perhaps you want to use trial-level variables to generate separate `survey` trials, for instance in order to incorporate them into a larger repeating trial procedure. jsPsych's [timeline variables](timeline.md#timeline-variables) feature was designed to address this use case, but the use of timeline variables looks a little different with the `survey` plugin. This is because the various individual parameters that you might want to change across `survey` trials don't have their own plugin parameters - instead everything is nested within the `survey_json` parameter. Below are some examples showing how you can programmatically generate survey trials using a set of trial-level variables.

1. **Use the conventional timeline variables approach with the `survey_json` parameter.** This approach is probably not ideal, because the timeline variables array has to contain the entire `survey_json` object for each trial. This kind of defeats the purpose of timeline variables, because you are still defining all of the survey JSON separately for each question/trial. In any case, here's what it looks like:

    ```javascript
    const word_trials = {
      timeline: [
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '+',
          choices: "NO_KEYS",
          trial_duration: 500
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: jsPsych.timelineVariable('word'),
          choices: "NO_KEYS",
          trial_duration: 1000
        },
        {
          type: jsPsychSurvey,
          survey_json: jsPsych.timelineVariable('survey_json'),
          data: { word: jsPsych.timelineVariable('word') }
        }
      ],
      timeline_variables: [
        {
          word: 'cheese',
          survey_json: { elements: [ {type: "text", title: "Enter a word related to CHEESE:", autocomplete: "off" } ], showQuestionNumbers: false, completeText: "Next", focusFirstQuestionAutomatic: true } 
        },
        {
          word: 'ring',
          survey_json: { elements: [ {type: "text", title: "Enter a word related to RING:", autocomplete: "off" } ], showQuestionNumbers: false, completeText: "Next", focusFirstQuestionAutomatic: true } 
        },
        {
          word: 'bat',
          survey_json: { elements: [ {type: "text", title: "Enter a word related to BAT:", autocomplete: "off" } ], showQuestionNumbers: false, completeText: "Next", focusFirstQuestionAutomatic: true }
        },
        {
          word: 'cow',
          survey_json: { elements: [ {type: "text", title: "Enter a word related to COW:", autocomplete: "off" } ], showQuestionNumbers: false, completeText: "Next", focusFirstQuestionAutomatic: true }
        }
      ]
    };
    ```

    !!! tip "Consider using a survey-* plugin for presenting a single question type"
        The example above was created just to demonstrate how to combine the `survey` plugin and timeline variables. But if this were a real experiment, since each survey trial contains just one question, we'd be better off using one of the other survey-* plugins because the parameterization of those plugins works well with timeline variables. Of course, you may have other reasons for wanting to use the `survey` plugin in this type of trial procedure, for instance to take advantage of some its convenience features (e.g. different question types on the same page, response validation).


2. **Use jsPsych's [functions-as-parameters](https://www.jspsych.org/7.3/overview/dynamic-parameters/#dynamic-parameters) approach for the `survey_json` parameter.** With this approach, instead of defining a static JSON object for the value of `survey_json`, you would write a _function_ that returns the survey JSON object for that specific trial. 

    This approach allows you to define the survey content using a combination of variable and static values. Also, jsPsych will run this function right before the trial begins, which means that you can change the survey content dynamically based on information that only becomes available during the experiment. Here's an example using timeline variables, though you can use the same approach to dynamically create the survey content without using timeline variables.

    ```javascript
    const word_trials = {
      timeline: [
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '+',
          choices: "NO_KEYS",
          trial_duration: 500
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: jsPsych.timelineVariable('word'),
          choices: "NO_KEYS",
          trial_duration: 1000
        },
        {
          type: jsPsychSurvey,
          survey_json: function() {
            // This is a function that dynamically creates the JSON configuration for each trial.
            // Inside the function, you can access timeline variables, jsPsych data, and other global variables
            // that you define. This function will be called right before the trial starts.
            const this_trial_json = { 
              elements: [
                {
                  type: "text", 
                  title: `Enter a word related to ${jsPsych.timelineVariable('word').toUpperCase()}:`, 
                  autocomplete: "off" 
                }
              ], 
              showQuestionNumbers: false, 
              completeText: "Next", 
              focusFirstQuestionAutomatic: true 
            }
            return this_trial_json;
          },
          data: { word: jsPsych.timelineVariable('word') }
        }
      ],
      timeline_variables: [
        { word: 'cheese' },
        { word: 'ring' },
        { word: 'bat' },
        { word: 'cow' }
      ]
    };
    ```

3. **Use the `survey_function` parameter.** You can reference trial-level variables from inside this function, so the general idea here is the same as the example above. The difference is that here you are using SurveyJS's JavaScript API syntax to create the survey content, instead of the JSON configuration. Again, this could be done without timeline variables, but this example uses timeline variables for convenience:

    ```javascript
    const create_word_survey = (survey) => {
      // Create question using timeline variables
      const page = survey.addNewPage('page1');
      const question = page.addNewQuestion('text'); 
      question.title = `Enter a word related to ${jsPsych.timelineVariable('word').toUpperCase()}`;
      question.autocomplete = "off";
      // Set survey-level parameters
      survey.showQuestionNumbers = false;
      survey.completeText = "Next";
      survey.focusFirstQuestionAutomatic = true;
    }

    const word_trials = {
      timeline: [
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '+',
          choices: "NO_KEYS",
          trial_duration: 500
        },
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: jsPsych.timelineVariable('word'),
          choices: "NO_KEYS",
          trial_duration: 1000
        },
        {
          type: jsPsychSurvey,
          survey_function: create_word_survey,
          data: { word: jsPsych.timelineVariable('word') }
        }
      ],
      timeline_variables: [
        { word: 'cheese' },
        { word: 'ring' },
        { word: 'bat' },
        { word: 'cow' }
      ]
    };
    ```

