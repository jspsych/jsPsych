/*
 * Example plugin template
 */

jsPsych.plugins["iat"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // allow variables as functions
    // this allows any trial variable to be specified as a function
    // that will be evaluated when the trial runs. this allows users
    // to dynamically adjust the contents of a trial as a result
    // of other trials, among other uses. you can leave this out,
    // but in general it should be included
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set default values for parameters
    trial.choices      = trial.choices || ["f", "j"];
    trial.stimulus     = trial.stimulus || "N/A";
    trial.stimulus_is_image = (typeof trial.stimulus_is_image === "undefined") ? false : trial.stimulus_is_image; 
    trial.right_prompt = trial.right_prompt || "Right";
    trial.left_prompt  = trial.left_prompt || "Left";
    trial.category     = trial.category || "N/A";
    trial.pairing      = trial.pairing || "left";
    trial.timing_response = trial.timing_response || 0;

    // Pair the category with the correct side
    var side = trial.pairing.toLowerCase();
    var left_prompt = trial.left_prompt;
    var right_prompt = trial.right_prompt;

    // Add the category to the correct prompt side
    if (side === "left") {
       left_prompt = left_prompt + '<br/>' + trial.category;
    } else if (side === "right") {
       right_prompt = right_prompt + '<br/>' + trial.category;
    }   

    // store the response
    var response = {
      rt: -1,
      key: -1
    };
    
    // Display the left-side prompt
    display_element.append($("<div>", {
      html: left_prompt,
      id: "jspsych-iat-left-prompt",
      css: {
        position: "absolute",
        top: "1%",
        left: "1%"
      }
    }));

    //Display the right-side prompt
    display_element.append($("<div>", {
      html: right_prompt,
      id: "jspsych-iat-right-prompt",
      css: {
        position: "absolute",
        top: "1%",
        right: "1%"
      }
    }));

    // If the stimulus is an image, use it, otherwise it's just text
    if (trial.stimulus_is_image) {
      display_element.append($("<img>", {
        src: trial.stimulus,
        id: "jspsych-iat-stimulus"
      }));
    } else {
      // Display the stimuli
      display_element.append($("<div>", {
        html: trial.stimulus,
        id: "jspsych-iat-stimulus"
      }));
    }
    
    // Handler for the end of the trial
    var end_trial = function() {
      
      // Kill remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // Kill keyboard listener
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener); 

      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // Clear the display
      display_element.html("");

      // End the trial and move on to the next
      jsPsych.finishTrial(trial_data);

    };

    var response_handler = function(event) {
      // Only repond to the first event
      if (response.key === -1) {
        response = event
      }

      // End the trial
      end_trial();
    };
    
    // Initialize the keyboard event handler
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: response_handler,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });

    // End the trial if a maximum time is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
