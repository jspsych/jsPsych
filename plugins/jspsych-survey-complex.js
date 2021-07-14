// AUTHOR:
// Sally A.M. Hogenboom (https://github.com/SHogenboom)

// DATE:
// July, 2021

// ADAPTED FROM
// jspsych-plugin-template.js (how to structure plugins)
// jspsych-survey-html-form.js
// jspsych-survey-multi-choice.js (form validation)
// jspsych-survey-multi-select.js
// jspsych-survey-text.js (textareas as input)
// https://www.w3schools.com/html/html_forms.asp (input options)
// https://moderncss.dev/pure-css-custom-styled-radio-buttons/ (input styling)
// https://www.w3schools.com/howto/howto_css_custom_checkbox.asp (input styling)
// https://www.geeksforgeeks.org/how-to-style-a-checkbox-using-css/ (input styling)

// DESCRIPTION
// The purpose of this plugin is to display a new type of survey question.
// In contrast to other survey plugins this one shows:
// 1 question per page
// Allows for single- or multiple-choice questions
// Allows each choice to be accompanied by a text field entry

// NOTE: styling options available in the 'jspsych-survey-complex.css' file.

// Initialize plugin
jsPsych.plugins["survey-complex"] = (function () {
  // Initialize
  var plugin = {};

  // The information that may be passed into the plugin
  // ... when called from a trial
  plugin.info = {
    // Name of the plugin - should be same as defined at the top.
    name: "survey-complex",
    parameters: {
      // QUESTION
      question_id: {
        description:
          "An easy identifier of the question. Not necessary, but can be used for easier data-analyses afterwards.",
        pretty_name: "question_id",
        type: jsPsych.plugins.parameterType.STRING,
        default: "",
      },
      question_text: {
        description:
          "The main question you want to display. By default, this will be the most prominent text on screen.",
        pretty_name: "question_text",
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: undefined,
      },
      question_subtext: {
        description:
          "A subtext to be displayed with the question. For example, providing background on why you are asking that question.",
        pretty_name: "question_subtext",
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: "",
      },
      // ANSWERS
      answers: {
        description: "An array of answer options.",
        pretty_name: "answers",
        array: true,
        type: jsPsych.plugins.parameterType.COMPLEX,
        nested: {
          answer_text: {
            description:
              "The label corresponding to the selected answer option (e.g., 'Female').",
            pretty_name: "answer_text",
            type: jsPsych.plugins.parameterType.HTML_STRING,
            default: undefined,
          },
          answer_explanation: {
            description:
              "Optional subtext to be displayed with the answer option (e.g., 'Please explain why: ')",
            pretty_name: "answer_explanation",
            type: jsPsych.plugins.parameterType.HTML_STRING,
            default: undefined,
          },
          answer_type: {
            description:
              "One of the following: single-choice; single-choice-text; multi-choice; multi-choice-text. See the documentation for examples of each.",
            pretty_name: "answer_type",
            type: jsPsych.plugins.parameterType.STRING,
            default: undefined,
          },
          answer_consequence: {
            description:
              "Optional data to be passed when an answer option is selected. Can be used in combination with condition nodes to abort questionnaires if specific answers are given.",
            pretty_name: "answer_consequence",
            type: jsPsych.plugins.parameterType.STRING,
            default: "Continue",
          },
        },
      },
      // SUBMIT BUTTON
      submit_text: {
        description: "Text to be displayd on the form/question submit button.",
        pretty_name: "submit_text",
        type: jsPsych.plugins.parameterType.STRING,
        default: "Save & Continue",
      },
      error_message: {
        description:
          "Message to be displayed next to the submit button. Specifying which behavior is expected before answers can be submitted.",
        pretty_name: "error_message",
        type: jsPsych.plugins.parameterType.STRING,
        default: "You must select at least one answer.",
      },
    }, // END parameters
  }; // END plugin.info

  // What actually happens in the trial (actions, visualizations etc)
  // `display_element` is the name of the HTML object that can be modified.
  // Basicly covers the entire screen.
  // `trial` is the information about the trial, as specified in plugin.info.
  plugin.trial = function (display_element, trial) {
    // PARAMETERS
    var startTime = performance.now(); // start response time tracking

    // FUNCTIONS
    // General function for creating a container that will hold child elements
    createDivContainer = function (elem_id, parent_elem) {
      // Initialize
      container_elem = document.createElement("div"); // create div element
      container_elem.id = elem_id; // give unique id to the element
      container_elem.className = elem_id;
      // Add to the document
      parent_elem.appendChild(container_elem);
      // Return created element
      container_elem = document.getElementById(elem_id);
      return container_elem;
    };

    // QUESTION
    // Create container
    question_container = createDivContainer(
      "jspsych-question-container", // id of the new element
      display_element // add to entire screen
    );
    // Add question text
    question = document.createElement("H1"); // title element
    question.id = "jspsych-question-" + trial.question_id; // unique identifier
    question.className = "jspsych-question-text"; // for styling see jspych-survey-complex.css
    question.innerHTML = trial.question_text; // add content
    question_container.appendChild(question); // add to container
    // Add explanation
    question_subtext = document.createElement("p"); // text element
    question_subtext.className = "jspsych-question-subtext"; // for styling see jspych-survey-complex.css
    question_subtext.innerHTML = trial.question_subtext; // add content
    question_container.appendChild(question_subtext); // add to container
    // Add "multiple-answers allowed" alert
    // Check if any of the answers are "multi-choice" / "multi-choice-text"
    // If not the case the find function returns 'undefined'
    var multi_choice = trial.answers.find((el) =>
      el.answer_type.includes("multi-choice")
    );

    if (multi_choice) {
      question_multi_choice = document.createElement("p"); // text element
      question_multi_choice.className = "jspsych-question-multi-choice"; // for styling see jspych-survey-complex.css
      question_multi_choice.innerHTML = "Multiple answers allowed"; // add content
      question_container.appendChild(question_multi_choice); // add to container
    }

    // ANSWERS
    // Create container
    form_container = createDivContainer(
      "jspsych-form-container", // id of the new element
      display_element // add to entire screen
    );
    // Create form
    form = document.createElement("form");
    form.id = "jspsych-form";
    form.autocomplete = "off";
    form_container.appendChild(form); // add form
    form = document.getElementById("jspsych-form");

    // Add answers from loop
    for (i = 0; i < trial.answers.length; i++) {
      // Get content
      answer = trial.answers[i];

      // CREATE CONTAINER
      // A general box around the whole answer option
      answer_container = createDivContainer("jspsych-answer-box-" + i, form);
      answer_container.className = "jspsych-answer-container";
      // Add interactivity
      // Ensure that the correct answer option is select if a participant
      // ... clicks anywhere inside the larger answer box.
      container_elem.onclick = function () {
        // Get id of the clicked element
        answer_box_id = this.id;
        // Determine the corresponding input element
        input_id = answer_box_id.replace("jspsych-answer-box", "jspsych-input");
        // Reverse the current status (also allows for easy de-selecting)
        document.getElementById(input_id).checked =
          !document.getElementById(input_id).checked;
      };

      // CREATE INPUT CONTAINER
      answer_input_container = document.createElement("span");
      answer_input_container.id = "jspsych-input-container-" + i;
      answer_input_container.className = "jspsych-input-container";

      // CREATE INPUT
      answer_input = document.createElement("input");
      answer_input.id = "jspsych-input-" + i;
      answer_input.name = "jspsych-input";
      answer_input.className = "jspsych-input-" + answer.answer_type;
      answer_input.value = answer.answer_text;
      if (answer.answer_type.includes("single-choice")) {
        answer_input.type = "radio";
      } else {
        answer_input.type = "checkbox";
      }
      // Prevent default behavior, as the container already triggers the select
      answer_input.onclick = function (elem) {
        elem.preventDefault();
      };
      // Add input to input container
      answer_input_container.appendChild(answer_input);

      // CREATE NEW INPUT SPAN
      answer_new_input = document.createElement("span");
      answer_new_input.id = "jspsych-input-" + answer_input.type + i;
      answer_new_input.className = "jspsych-input-" + answer_input.type;
      // Add new input to input container
      answer_input_container.appendChild(answer_new_input);

      // CREATE LABEL CONTAINER
      answer_label_container = document.createElement("label");
      answer_label_container.id = "jspsych-label-container-" + i;
      answer_label_container.className = "jspsych-label-container";
      // Prevent default behavior, as the container already triggers the select
      answer_label_container.onclick = function (elem) {
        elem.preventDefault();
      };
      // Add input container
      answer_label_container.appendChild(answer_input_container);

      // CREATE LABEL SPAN
      answer_label = document.createElement("span");
      answer_label.id = "jspsych-label-" + i;
      answer_label.className = "jspsych-label";
      answer_label.innerHTML = answer.answer_text;
      // Add to label container
      answer_label_container.appendChild(answer_label);
      // Add container to answer option
      answer_container.appendChild(answer_label_container);

      // Add answer_explanation
      if (answer.answer_explanation.length != 0) {
        answer_explanation = document.createElement("span");
        answer_explanation.id = "jspsych-answer-explanation-" + i;
        answer_explanation.className = "jspsych-answer-explanation";
        answer_explanation.innerHTML = answer.answer_explanation;
        answer_container.appendChild(answer_explanation);
      }

      // Add answer textboxes
      if (answer.answer_type.includes("text")) {
        answer_textbox = document.createElement("textarea");
        answer_textbox.id = "jspsych-answer-textbox-" + i;
        answer_textbox.className = "jspsych-answer-textbox";
        answer_container.appendChild(answer_textbox);
      }
    } // END ANSWER LOOP

    // SUBMIT CONTAINER
    submit_container = createDivContainer("jspsych-submit-container", form);
    submit_container.className = "jspsych-submit-container";

    // SUBMIT BUTTON
    submit_button = document.createElement("input");
    submit_button.id = "jspsych-submit-button";
    submit_button.type = "submit";
    submit_button.className = "jspsych-submit-button";
    submit_button.value = trial.submit_text;
    submit_button.disabled = true; // start disabled because no answers are pre-selected
    // Add button to the container/form
    submit_container.appendChild(submit_button);

    // VALIDATION MESSAGE
    validation_message = document.createElement("p");
    validation_message.id = "jspsych-validation-message";
    validation_message.className = "jspsych-validation-message";
    validation_message.innerHTML = trial.error_message;
    // Add validation box to container
    submit_container.appendChild(validation_message);

    // REQUEST ANSWER
    // Validate answers with each click
    display_element.onclick = function () {
      // CHECKED ANSWERS
      // Find which answer options have been selected.
      checked_answers = display_element.querySelectorAll(
        "#jspsych-form input:checked"
      );

      if (checked_answers.length >= 1) {
        // At least one answer option was selected
        // Remove validation message
        document.getElementById("jspsych-validation-message").innerHTML = "";
        // Activate submit button
        document.getElementById("jspsych-submit-button").disabled = false;
      } else {
        // NO answers were selected.
        // Set validation message
        document.getElementById("jspsych-validation-message").innerHTML =
          trial.error_message;
        // disable submit button
        document.getElementById("jspsych-submit-button").disabled = true;
      } // END IF answers selected
    }; // END request answer

    // SUBMIT ANSWERS
    // Submit the content of all selected answers
    form.onsubmit = function (elem) {
      // prevents the default submit behavior of a form.
      elem.preventDefault();

      // RESPONSE TIME
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // SAVE ANSWERS
      // Find all answer options
      answer_options = display_element.querySelectorAll("#jspsych-form input");

      // Initialize output
      checked_answers = [];
      stop_questionnaire = false;

      // Loop over all answers
      for (var a = 0; a < answer_options.length; a++) {
        // Only save response if the answer was selected
        if (answer_options[a].checked) {
          // find answer type
          answer_type = answer_options[a].getAttribute("class");

          // Given answer (label of the selected input)
          answer = answer_options[a].value;
          answer_text = "";

          // Determine if the answer option contains adition text
          if (answer_type.includes("text")) {
            // The answer option contains an additional text box with information
            text_box_id = answer_options[a]
              .getAttribute("id")
              .replace("jspsych-input-", "jspsych-answer-textbox-");
            answer_text = document.getElementById(text_box_id).value;
          }

          // Check if the questionnaire should be stopped
          if (trial.answers[a].answer_consequence == "Stop") {
            stop_questionnaire = true;
          } // END IF stop_questionnaire

          // Save response
          checked_answers.push({
            answer: answer,
            answer_text: answer_text,
          });
        }
      } // END LOOP

      // SAVE DATA
      var trial_data = {
        question_id: trial.question_id,
        response_time: response_time,
        response: checked_answers,
        stop_questionnaire: stop_questionnaire,
      };

      // NEXT TRIAL
      // Clear screen for next trial
      display_element.innerHTML = "";
      // present next trial
      jsPsych.finishTrial(trial_data);
    };
  }; // END plugin

  return plugin;
})(); // END FUNCTION
