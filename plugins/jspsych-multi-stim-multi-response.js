/**
 * jspsych-muli-stim-multi-response
 * Josh de Leeuw
 *
 * plugin for displaying a set of stimuli and collecting a set of responses
 * via the keyboard
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["multi-stim-multi-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('multi-stim-multi-response', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'multi-stim-multi-response',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
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
        default: undefined,
        array: true,
        no_function: false,
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
        default: 1000,
        array: true,
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
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    // timing parameters
    var default_timing_array = [];
    for (var j = 0; j < trial.stimuli.length; j++) {
      default_timing_array.push(1000);
    }
    trial.timing_stim = trial.timing_stim || default_timing_array;
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    // optional parameters
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);


    // array to store if we have gotten a valid response for
    // all the different response types
    var validResponses = [];
    for (var i = 0; i < trial.choices.length; i++) {
      validResponses[i] = false;
    }

    // array for response times for each of the different response types
    var responseTimes = [];
    for (var i = 0; i < trial.choices.length; i++) {
      responseTimes[i] = -1;
    }

    // array for response keys for each of the different response types
    var responseKeys = [];
    for (var i = 0; i < trial.choices.length; i++) {
      responseKeys[i] = -1;
    }

    // function to check if all of the valid responses are received
    function checkAllResponsesAreValid() {
      for (var i = 0; i < validResponses.length; i++) {
        if (validResponses[i] == false) {
          return false;
        }
      }
      return true;
    }

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // gather the data to store for the trial
      var trial_data = {
        "rt": JSON.stringify(responseTimes),
        "stimulus": JSON.stringify(trial.stimuli),
        "key_press": JSON.stringify(responseKeys)
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      var whichResponse;
      for (var i = 0; i < trial.choices.length; i++) {

        // allow overlap between response groups
        if (validResponses[i]) {
          continue;
        }

        for (var j = 0; j < trial.choices[i].length; j++) {
          keycode = (typeof trial.choices[i][j] == 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.choices[i][j]) : trial.choices[i][j];
          if (info.key == keycode) {
            whichResponse = i;
            break;
          }
        }

        if (typeof whichResponse !== 'undefined') {
          break;
        }
      }

      if (validResponses[whichResponse] != true) {
        validResponses[whichResponse] = true;
        responseTimes[whichResponse] = info.rt;
        responseKeys[whichResponse] = info.key;
      }

      if (trial.response_ends_trial) {

        if (checkAllResponsesAreValid()) {
          end_trial();
        }

      }

    };

    // flattened version of the choices array
    var allchoices = [];
    for (var i = 0; i < trial.choices.length; i++) {
      allchoices = allchoices.concat(trial.choices[i]);
    }

    var whichStimulus = 0;

    function showNextStimulus() {

      // display stimulus
      if (!trial.is_html) {
        display_element.innerHTML += '<img id="jspsych-multi-stim-multi-response-stimulus" src="'+trial.stimuli[whichStimulus]+'"></img>';
      } else {
        display_element.innerHTML += '<div id="jspsych-multi-stim-multi-response-stimulus">'+trial.stimuli[whichStimulus]+'</div>';
      }

      //show prompt if there is one
      if (trial.prompt !== "") {
        display_element.innerHTML += trial.prompt;
      }

      if (typeof trial.timing_stim[whichStimulus] !== 'undefined' && trial.timing_stim[whichStimulus] > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          // clear the display, or hide the display
          if (typeof trial.stimuli[whichStimulus + 1] !== 'undefined') {
            display_element.innerHTML = '';
            // show the next stimulus
            whichStimulus++;
            showNextStimulus();
          } else {
            display_element.querySelector('#jspsych-multi-stim-multi-response-stimulus').style.visibility = 'hidden';
          }

        }, trial.timing_stim[whichStimulus]);
      }

    }

    // show first stimulus
    showNextStimulus();

    // start the response listener
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: allchoices,
      rt_method: 'date',
      persist: true,
      allow_held_key: false
    });

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
