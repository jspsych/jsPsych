/**
 * Derived from jspsych-same-different by Josh de Leeuw
 *
 * plugin for showing two stimuli sequentially with a mask between them. Will either show the
 * same image the second time or show the other image the second time. Similar to a delayed
 * match to sample but doing it as a yes/no (same/different) and not forced choice
 *
 * 
 *
 */

jsPsych.plugins['delay-yesno-match-buttons'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('delay-yesno-match-buttons', 'stimuli', 'image')

  plugin.info = {
    name: 'delay-yesno-match-buttons',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'The images to be displayed. First is the target and 2nd the potential foil'
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
      answer: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Answer',
        options: ['same', 'different'],
        default: 75,
        description: 'Either "same" or "different". Controls the correct answer and which is shown second'
      },
      same_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Same label',
        default: 'Same',
        array: false,
        description: 'The labels for the buttons.'
      },
      different_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Different label',
        default: 'Different',
        array: false,
        description: 'The labels for the buttons.'
      },
      first_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'First stimulus duration',
        default: 1000,
        description: 'How long to show the first stimulus for in milliseconds.'
      },
      gap_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Gap duration',
        default: 500,
        description: 'How long to show the mask in between the two stimuli.'
      },
      second_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Second stimulus duration',
        default: 1000,
        description: 'How long to show the second stimulus for in milliseconds.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<img class="jspsych-yesno-match-stimulus" src="'+trial.stimuli[0]+'"></img>';

    var first_stim_info;
    if (trial.first_stim_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        showMaskScreen();
      }, trial.first_stim_duration);
    } else {
      function afterKeyboardResponse(info) {
        first_stim_info = info;
        showMaskScreen();
      }
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterKeyboardResponse,
        valid_responses: trial.advance_key,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    function showMaskScreen() {
      display_element.innerHTML = '<img class="jspsych-yesno-match-stimulus" src="'+trial.stimuli[2]+'"></img>';

      jsPsych.pluginAPI.setTimeout(function() {
        showSecondStim();
      }, trial.gap_duration);
    }

    function showSecondStim() {

      var html = '<img class="jspsych-yesno-match-stimulus" src="'+trial.stimuli[1]+'"></img>';
      if (trial.answer == 'same') {
        html = '<img class="jspsych-yesno-match-stimulus" src="'+trial.stimuli[0]+'"></img>';
      }

      // show buttons
      var buttons = [];
      buttons.push(trial.button_html);
      buttons.push(trial.button_html);
      html += '<div id="jspsych-html-button-response-btngroup">';
      var str = buttons[0].replace(/%choice%/g, trial.same_label);
      html += '<div class="jspsych-yesno-match-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-yesno-match-button-response-button-' + 0 +'" data-choice="'+0+'">'+str+'</div>';
      str = buttons[1].replace(/%choice%/g, trial.different_label);
      html += '<div class="jspsych-yesno-match-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-yesno-match-button-response-button-' + 1 +'" data-choice="'+1+'">'+str+'</div>';
      html += '</div>';
  
      //show prompt
      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      display_element.innerHTML = html;

      // start timing
      var start_time = performance.now();

      if (trial.second_stim_duration > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('.jspsych-yesno-match-stimulus').style.visibility = 'hidden';
        }, trial.second_stim_duration);
      }


      function after_response(choice) {

        // measure rt
        var end_time = performance.now();
        var rt = end_time - start_time;
        response.button = choice;  // 0=Same/Yes, 1=Diff/no
        response.rt = rt;

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        var correct = false;
        if (choice == 0 && trial.answer == 'same') {
          correct = true;
        }
        if (choice == 1 && trial.answer == 'different') {
          correct = true;
        }

        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        //display_element.querySelector('#jspsych-yesno-match-stimulus').className += ' responded';

        // disable all the buttons after a response
        var btns = document.querySelectorAll('.jspsych-yesno-match-button-response-button button');
        for(var i=0; i<btns.length; i++){
          //btns[i].removeEventListener('click');
          btns[i].setAttribute('disabled', 'disabled');
        }
        var trial_data = {
          "rt": response.rt,
          "answer": trial.answer,
          "correct": correct,
          "stimulus": JSON.stringify([trial.stimuli[0], trial.stimuli[1]]),
          "button_pressed": response.button
        };
        // if (first_stim_info) {
        //   trial_data["rt_stim1"] = first_stim_info.rt;
        //   trial_data["key_press_stim1"] = first_stim_info.key;
        // }

        display_element.innerHTML = '';

        jsPsych.finishTrial(trial_data);
      }

      for (var i = 0; i < 2; i++) {
        display_element.querySelector('#jspsych-yesno-match-button-response-button-' + i).addEventListener('click', function(e){
          var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
      }
      // store response
      var response = {
        rt: null,
        button: null
      };

      // jsPsych.pluginAPI.getKeyboardResponse({
      //   callback_function: after_response,
      //   valid_responses: [trial.same_key, trial.different_key],
      //   rt_method: 'performance',
      //   persist: false,
      //   allow_held_key: false
      // });

    }

  };

  return plugin;
})();
