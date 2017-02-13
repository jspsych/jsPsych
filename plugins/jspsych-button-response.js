/**
 * jspsych-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["button-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('button-response', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'button-response',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: [],
        array: true,
        no_function: false,
        description: ''
      },
      button_html: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '<button class="jspsych-btn">%choice%</button>',
        no_function: false,
        array: true,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      timing_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      timing_response: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1; // if -1, then show indefinitely
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    trial.margin_vertical = trial.margin_vertical || "0px";
    trial.margin_horizontal = trial.margin_horizontal || "8px";

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // display stimulus
    if (!trial.is_html) {
      display_element.innerHTML = '<img src="'+trial.stimulus+'" id="jspsych-button-response-stimulus"></img>';
    } else {
      display_element.innerHTML = '<div id="jspsych-button-response-stimulus">'+trial.stimulus+'</div>';
    }

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML += '<div id="jspsych-button-response-btngroup"></div>';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      display_element.querySelector('#jspsych-button-response-btngroup').insertAdjacentHTML('beforeend',
        '<div class="jspsych-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
      display_element.querySelector('#jspsych-button-response-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.dataset.choice;
        after_response(choice);
      });
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.insertAdjacentHTML('beforeend', trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      button: -1
    };

    // start time
    var start_time = 0;

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-button-response-stimulus').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelector('.jspsych-button-response-button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start timing
    start_time = Date.now();

    // hide image if timing is set
    if (trial.timing_stim > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-button-response-stimulus').style.visibility = 'hidden';
      }, trial.timing_stim);
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
