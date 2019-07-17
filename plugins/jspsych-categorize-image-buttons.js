/**
 *
 * 
 * Based on JdL's jspsych-categorize-image.js, and converted to use button presses
 * 
 * key_answer: now a string
 * choices: now an array of strings of button labels (paralleling the other button tools in jsPsych)
 * button_html: added (parallels all other button_html parameters in jsPsych)
 * 
 **/


jsPsych.plugins['categorize-image-buttons'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('categorize-image-buttons', 'stimulus', 'image');

  plugin.info = {
    name: 'categorize-image-buttons',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image content to be displayed.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      button_answer: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Button answer',
        default: undefined,
        description: 'The button index to indicate the correct response.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      text_answer: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Text answer',
        default: null,
        description: 'Label that is associated with the correct answer.'
      },
      correct_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Correct text',
        default: "<p class='feedback'>Correct</p>",
        description: 'String to show when correct answer is given.'
      },
      incorrect_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Incorrect text',
        default: "<p class='feedback'>Incorrect</p>",
        description: 'String to show when incorrect answer is given.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      force_correct_button_press: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Force correct button press',
        default: false,
        description: 'If set to true, then the subject must press the correct response key after feedback in order to advance to next trial.'
      },
      show_stim_with_feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        no_function: false,
        description: ''
      },
      show_feedback_on_timeout: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show feedback on timeout',
        default: false,
        description: 'If true, stimulus will be shown during feedback. If false, only the text feedback will be displayed during feedback.'
      },
      timeout_message: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Timeout message',
        default: "<p>Please respond faster.</p>",
        description: 'The message displayed on a timeout non-response.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial'
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Feedback duration',
        default: 2000,
        description: 'How long to show feedback.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<img id="jspsych-categorize-image-buttons-stimulus" class="jspsych-categorize-image-buttons-stimulus" src="'+trial.stimulus+'"></img>';

    // hide image after time if the timing parameter is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-categorize-image-buttons-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in categorize-image-buttons plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML += '<div id="jspsych-categorize-image-buttons-btngroup">';

    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      display_element.innerHTML += '<div class="jspsych-categorize-image-buttons-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-categorize-image-buttons-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
    display_element.innerHTML += '</div>';

    // if prompt is set, show prompt
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }

    // start timing
    var start_time = performance.now();

    var trial_data = {};

    // create response function
    function after_response(choice) {

        // measure rt
        var end_time = performance.now();
        var rt = end_time - start_time;
        response.button = choice;  // 0=Same/Yes, 1=Diff/no
        response.rt = rt;

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        var correct = false;
        if (choice == trial.button_answer) {correct = true; }

        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        //display_element.querySelector('#jspsych-yesno-match-stimulus').className += ' responded';

        // disable all the buttons after a response
        var btns = document.querySelectorAll('.jspsych-categorize-image-buttons-button button');
        for(var i=0; i<btns.length; i++){
          console.log('disabled button ' + i);
          btns[i].setAttribute('disabled', 'disabled');
        }
        var trial_data = {
          "rt": response.rt,
          "correct": correct,
          "stimulus": trial.stimulus,
          "button_pressed": response.button
        };

    //   // save data
    //   trial_data = {
    //     "rt": info.rt,
    //     "correct": correct,
    //     "stimulus": trial.stimulus,
    //     "key_press": info.key
    //   };

        display_element.innerHTML = '';

        var timeout = choice == null;
        doFeedback(correct, timeout);
    }

    // jsPsych.pluginAPI.getKeyboardResponse({
    //   callback_function: after_response,
    //   valid_responses: trial.choices,
    //   rt_method: 'performance',
    //   persist: false,
    //   allow_held_key: false
    // });


    for (var i = 0; i < trial.choices.length; i++) {
        display_element.querySelector('#jspsych-categorize-image-buttons-button-' + i).addEventListener('click',function(e){
            var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
            after_response(choice);
          });
    }
    // store response
    var response = {
    rt: null,
    button: null
    };

    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        after_response(null);
      }, trial.trial_duration);
    }

    function doFeedback(correct, timeout) {

      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        // show image during feedback if flag is set
        if (trial.show_stim_with_feedback) {
          display_element.innerHTML = '<img id="jspsych-categorize-image-buttons-stimulus" class="jspsych-categorize-image-buttons-stimulus" src="'+trial.stimulus+'"></img>';
        }

        // substitute answer in feedback string.
        var atext = "";
        if (correct) {
          atext = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }

        // show the feedback
        display_element.innerHTML += atext;
      }
      // check if force correct button press is set
      if (trial.force_correct_button_press && correct === false && ((timeout && trial.show_feedback_on_timeout) || !timeout)) {

        // Recreate all our buttons
        var buttons = [];
        if (Array.isArray(trial.button_html)) {
          if (trial.button_html.length == trial.choices.length) {
            buttons = trial.button_html;
          } else {
            console.error('Error in categorize-image-buttons plugin. The length of the button_html array does not equal the length of the choices array');
          }
        } else {
          for (var i = 0; i < trial.choices.length; i++) {
            buttons.push(trial.button_html);
          }
        }
        display_element.innerHTML += '<div id="jspsych-categorize-image-buttons-btngroup">';
    
        for (var i = 0; i < trial.choices.length; i++) {
          var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
          display_element.innerHTML += '<div class="jspsych-categorize-image-buttons-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-categorize-image-buttons-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
        }
        display_element.innerHTML += '</div>';
    
        // Put a listener only on the correct button and have that run endTrial
        display_element.querySelector('#jspsych-categorize-image-buttons-button-' + trial.button_answer).addEventListener('click',function(e){
            endTrial();
        });
    
        // jsPsych.pluginAPI.getKeyboardResponse({
        //   callback_function: after_forced_response,
        //   valid_responses: [trial.key_answer],
        //   rt_method: 'performance',
        //   persist: false,
        //   allow_held_key: false
        // });

      } else {
        jsPsych.pluginAPI.setTimeout(function() {
          endTrial();
        }, trial.feedback_duration);
      }

    }

    function endTrial() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
