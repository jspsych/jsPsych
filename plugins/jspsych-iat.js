/**
 * jspsych-single-stim
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["iat"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('iat', 'stimulus', 'image');

  
  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-iat";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }


    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set default values for the parameters
    trial.display_feedback = trial.display_feedback || false;
    trial.image_when_wrong = trial.image_when_wrong || 'undefined';
    trial.left_category_key = trial.left_category_key || 'e';
    trial.right_category_key = trial.right_category_key || 'i';
    trial.left_category_label = trial.left_category_label || ['left'];
    trial.right_category_label = trial.right_category_label || ['right']; 
    trial.stim_key_association = trial.stim_key_association || 'undefined';
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.key_to_move_forward = trial.key_to_move_forward || jsPsych.ALL_KEYS;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt = trial.prompt || "";

    //Creates extra styling needed 
    var node = display_element.innerHTML += '<style id="jspsych-iat-css">';
    var cssstr = ".jspsych-iat-left {float: left; margin: 0px 150px 30px 0px;}" + 
    ".jspsych-iat-right {float: right; margin: 0px 0px 30px 150px;}" 

    display_element.querySelector('#jspsych-iat-css').innerHTML = cssstr;

    //Get keys to continue and put them in a string 
    var i;
    var keysToContinue = "";
    var lastKey = trial.key_to_move_forward.length - 1;
    for(i = 0; i < lastKey; i++) {
      keysToContinue += trial.key_to_move_forward[i] + ", ";
    }

    var html_str = "";
    html_str += "<div style='position: relative; width: 900px;' id='jspsych-iat-stim'>";

    if (!trial.is_html) {
      html_str += "<div style='position: fixed; width: 170px; height: 110px; left: 560px; bottom: 380px;'><img src='"+trial.stimulus+"' id='jspsych-iat-stim'></img></div>";
    } else {
      html_str += '<div style="position: fixed; width: 170px; height: 110px; left: 560px; bottom: 380px;"><p id="jspsych-iat-stim">'+trial.stimulus+'</p></div>';
    } 

    html_str += "<div id='trial_left_align' style='position: fixed; left: 100px; top: 80px;'>";

    if(trial.left_category_label.length == 1) {
      html_str += '<p>Press ' + trial.left_category_key.toUpperCase() + ' for:<br> ' + 
      trial.left_category_label[0].toUpperCase().bold() + '</p>';
    } else {
      html_str += '<p>Press ' + trial.left_category_key.toUpperCase() + ' for:<br> ' + 
      trial.left_category_label[0].toUpperCase().bold() + '<br>' + 'or<br>' +
      trial.left_category_label[1].toUpperCase().bold() + '</p>';
    }
    
    html_str += "</div><div id='trial_right_align' style='position: fixed; right: 100px; top: 80px;'>";

    if(trial.right_category_label.length == 1) {
      html_str += '<p>Press ' + trial.right_category_key.toUpperCase() + ' for:<br> ' + 
      trial.right_category_label[0].toUpperCase().bold() + '</p>';
    } else {
      html_str += '<p>Press ' + trial.right_category_key.toUpperCase() + ' for:<br> ' + 
      trial.right_category_label[0].toUpperCase().bold() + '<br>' + 'or<br>' + 
      trial.right_category_label[1].toUpperCase().bold() + '</p>';
    }
    
    html_str += "</div><div id='wrongImg' style='position: fixed; width: 800px; height:100px; left: 250px; bottom: 150px;'>";

    if(trial.display_feedback == true) {


      html_str += '<div><img src="' + trial.image_when_wrong + '" style="visibility: hidden;" id="wrongImgID"></img></div>';
      var wImg = document.getElementById("wrongImgID");
      //wImg.style.visibility = "hidden"; 

      if(trial.key_to_move_forward.length == 0) {
        html_str += '<p>If you press the wrong key, a ' + trial.wrong_image_name + ' will appear. Press any key to continue.</p>';
      } else if(trial.key_to_move_forward.length == 1) {
        html_str += '<p>If you press the wrong key, a ' + trial.wrong_image_name + ' appear. Press ' + trial.key_to_move_forward[0] + ' to continue.</p>';
      } else {
        html_str += '<p>If you press the wrong key, a ' + trial.wrong_image_name + ' appear. Press ' + 
        keysToContinue + ' ' + trial.key_to_move_forward[lastKey] + ' to continue.</p>';
      }
    } 
    else {
        html_str += '<p>Trial will continue automatically.</p>';
    }

    html_str += "</div></div>";
    
    display_element.innerHTML += html_str;


    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

    // store response
    var response = {
      rt: -1,
      key: -1,
      correct: false
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "correct": response.correct
      };

      jsPsych.data.write(trial_data);
      jsPsych.data.addDataToLastTrial(trial_data);
    
      // clears the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  
    var leftKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.left_category_key); 
    var rightKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.right_category_key);
    

    // function to handle responses by the subject
    var after_response = function(info) {
      var wImg = document.getElementById("wrongImgID");
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
       display_element.querySelector('#jspsych-iat-stim').className += ' responded';

      // only record the first response
      if (response.key == -1 ) {
        response = info;
      }
      
      if(trial.stim_key_association == "right") {
        if(response.rt > -1 && response.key == rightKeyCode) {
          response.correct = true;
          if(trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if(trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
          } else if(trial.response_ends_trial && trial.display_feedback != true) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: []
              });
          }
        }
        } 

        else if(trial.stim_key_association == "left") {
          if(response.rt > -1 && response.key == leftKeyCode) {
            response.correct = true;
            if(trial.response_ends_trial) {
              end_trial();
            }
          } else {
            response.correct = false;
            if(trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            }
            if (trial.response_ends_trial && trial.display_feedback == true) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
          } else if(trial.response_ends_trial && trial.display_feedback != true) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: []
              });
          }
          }
        } 
    };

    // start the response listener
    if (trial.left_category_key != jsPsych.NO_KEYS && trial.right_category_key != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_category_key, trial.right_category_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }
    

    // end trial if time limit is set
    if (trial.timing_response > 0 && trial.display_feedback != true) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
