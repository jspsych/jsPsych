// ----------------------------CODE UNDER REVIEW--------------------------
// There might be bugs so use cautiously
// Author of the simulation functionality: Nikolay Petrov (github: @nikbpetrov)
function get_simulate_method(plugin, trial_type) {
  if (trial_type === 'animation') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        // this allows to go through each image in the sequence as specified by the experimenter;
        let additional_wait_before_key_press = ((trial.frame_time + trial.frame_isi) * (trial.stimuli.length*trial.sequence_reps))
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, additional_wait_before_key_press + trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'audio-button-response') {
    plugin.simulate = function(trial) {
      if (trial.choices !== []) { // this if is most likely not possible and hence can be removed
        var choice = Math.floor(Math.random() * trial.choices.length).toString() // from the buttons, get a random data-choice label
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-audio-button-response-button-' + choice).dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'audio-keyboard-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'audio-slider-response') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-audio-slider-response-response').dispatchEvent(new Event('click'))
          document.querySelector('#jspsych-audio-slider-response-response').value = getRandomInt(trial.min, trial.max)
          document.querySelector('#jspsych-audio-slider-response-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'canvas-button-response') {
    plugin.simulate = function(trial) {
      if (trial.choices !== []) { // this if is most likely not possible and hence can be removed
        var choice = Math.floor(Math.random() * trial.choices.length).toString() // from the buttons, get a random data-choice label
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-canvas-button-response-button-' + choice).dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'canvas-keyboard-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'canvas-slider-response') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-canvas-slider-response-response').dispatchEvent(new Event('click'))
          document.querySelector('#jspsych-canvas-slider-response-response').value = getRandomInt(trial.min, trial.max)
          document.querySelector('#jspsych-canvas-slider-response-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'categorize-animation') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        let additional_wait_before_key_press
        if (trial.allow_response_before_complete == true) {
          additional_wait_before_key_press = 0
        } else {
          // this allows to go through each image in the sequence as specified by the experimenter;
          // currently adding +1 as there seems to be an issue with the plugin, see https://github.com/jspsych/jsPsych/issues/1885
          // the +1 basically accounts for the blank pre-images screen, which seems to be the same duration as frame_time
          additional_wait_before_key_press = trial.frame_time * ((trial.stimuli.length*trial.sequence_reps) + 1)
        }

        console.log(additional_wait_before_key_press + trial.simulate_response_time)
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, additional_wait_before_key_press + trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'categorize-html') {
    plugin.simulate = function(trial) {
      if (trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];

        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
          // this is a very weird nesting of timers but the issue is that if it's not nested,
          // then pressing the wrong key_response actually ends up clearing all timers, which includes the one set here
          // see the after_response function in the trial method of the categorize-html plugin -- starts with  jsPsych.pluginAPI.clearAllTimeouts();
          // and only afterwards adds feedback and feedback keyboard listener (doFeedback function)
          if (trial.force_correct_button_press === true && trial.key_answer !== key_response) {
            jsPsych.pluginAPI.setTimeout(function(){
              document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: trial.key_answer}));
              document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: trial.key_answer}));
            }, trial.simulate_response_time)
          }
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'categorize-image') {
    plugin.simulate = function(trial) {
      if (trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
          // below is weird but see note above on the categorize-html plugin -- same issue of button press clearing timeouts
          if (trial.force_correct_button_press === true && trial.key_answer !== key_response) {
            jsPsych.pluginAPI.setTimeout(function(){
              document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: trial.key_answer}));
              document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: trial.key_answer}));
            }, trial.simulate_response_time)
          }
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'cloze') {
    plugin.simulate = function(trial) {
      let input_fields = document.querySelector('.cloze').querySelectorAll('input')

      // correct answers will always be in the uneven positions... I think
      // note that whitespace is ignored - good job, jsPsych!
      const cloze_text_as_arr = trial.text.split('%') 
      let correct_answers_arr = []
      for (let i=1; i<cloze_text_as_arr.length; i=i+2) {
        correct_answers_arr.push(cloze_text_as_arr[i])
      }

      for (let curr_input_field_ind=0; curr_input_field_ind < input_fields.length; curr_input_field_ind++) {
        if (input_fields[curr_input_field_ind].type !== 'submit') {
          if (trial.check_answers === true) {
            input_fields[curr_input_field_ind].value = correct_answers_arr[curr_input_field_ind]
          } else {
            const random_text = get_random_text()
            input_fields[curr_input_field_ind].value = random_text
          }
        }
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#finish_cloze_button').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'free-sort') {
    plugin.simulate = function(trial) {
      // this should have a method but currently does not have one implemented
      // hence the trial won't be simulated at all
    }
  }
  else if (trial_type === 'fullscreen') {
    plugin.simulate = function(trial) {
      // the trial will continue but won't enter full-screen mode as this 'can only be initiated by a user gesture'
      if (trial.fullscreen_mode === true) {
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-fullscreen-btn').dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }   
    }
  }
  else if (trial_type === 'html-button-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== []) { // this if is most likely not possible and hence can be removed
        var choice = Math.floor(Math.random() * trial.choices.length).toString() // from the buttons, get a random data-choice label
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-html-button-response-button-' + choice).dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }
    }
  } 
  else if (trial_type == 'html-keyboard-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'html-slider-response') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-html-slider-response-response').dispatchEvent(new Event('click'))
        document.querySelector('#jspsych-html-slider-response-response').value = getRandomInt(trial.min, trial.max)
        document.querySelector('#jspsych-html-slider-response-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'iat-html') {
    plugin.simulate = function(trial) {
      let valid_keys = [trial.left_category_key, trial.right_category_key]
      let key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.simulate_response_time);

      // handling case when feedback is to be displayed and incorrect repsonse is given
      if (trial.display_feedback === true) {
        
        // getting the correct key based on stim_key_assocation, 
        // and checking if left or right category keys are set to all keys, which should not be done
        let correct_key
        if (trial.left_category_key === jsPsych.ALL_KEYS || trial.right_category_key === jsPsych.ALL_KEYS) {
          // no need to be more specific with the feedback
          console.error('Either the left or the right category key for the iat-html trial is set to all keys which does not seem to make sense. Please verify.')
        }
        if (trial.stim_key_association === 'left') {
          correct_key = trial.left_category_key
        } else if (trial.stim_key_association === 'right') {
          correct_key = trial.right_category_key
        }

        // find the key that needs to be pressed - either the correct key if force_correct_key is true or the key_to_move_forward
        if (key_response !== correct_key) {
          let post_feedback_continue_key_response
          if (trial.force_correct_key_press === true) {
            post_feedback_continue_key_response = correct_key
          } else {
            const valid_keys_to_move_forward = trial.key_to_move_forward === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.key_to_move_forward
            post_feedback_continue_key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys_to_move_forward, 1)[0]; 
          }
          
          jsPsych.pluginAPI.setTimeout(function(){
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: post_feedback_continue_key_response}));
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: post_feedback_continue_key_response}));
          }, trial.simulate_response_time*2); // multiply by 2 to wait to display feedback
        }
      }
    }
  }
  else if (trial_type === 'iat-image') {
    plugin.simulate = function(trial) {
      let valid_keys = [trial.left_category_key, trial.right_category_key]
      let key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.simulate_response_time);

      // handling case when feedback is to be displayed and incorrect repsonse is given
      if (trial.display_feedback === true) {
        
        // getting the correct key based on stim_key_assocation, 
        // and checking if left or right category keys are set to all keys, which should not be done
        let correct_key
        if (trial.left_category_key === jsPsych.ALL_KEYS || trial.right_category_key === jsPsych.ALL_KEYS) {
          // no need to be more specific with the feedback
          console.error('Either the left or the right category key for the iat-html trial is set to all keys which does not seem to make sense. Please verify.')
        }
        if (trial.stim_key_association === 'left') {
          correct_key = trial.left_category_key
        } else if (trial.stim_key_association === 'right') {
          correct_key = trial.right_category_key
        }

        // find the key that needs to be pressed - either the correct key if force_correct_key is true or the key_to_move_forward
        if (key_response !== correct_key) {
          let post_feedback_continue_key_response
          if (trial.force_correct_key_press === true) {
            post_feedback_continue_key_response = correct_key
          } else {
            const valid_keys_to_move_forward = trial.key_to_move_forward === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.key_to_move_forward
            post_feedback_continue_key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys_to_move_forward, 1)[0]; 
          }
          
          jsPsych.pluginAPI.setTimeout(function(){
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: post_feedback_continue_key_response}));
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: post_feedback_continue_key_response}));
          }, trial.simulate_response_time*2); // multiply by 2 to wait to display feedback
        }
      }
    }
  }
  else if (trial_type === 'image-button-response') {
    plugin.simulate = function(trial) {
      if (trial.choices !== []) { // this if is most likely not possible and hence can be removed
        var choice = Math.floor(Math.random() * trial.choices.length).toString() // from the buttons, get a random data-choice label
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-image-button-response-button-' + choice).dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'image-keyboard-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'image-slider-response') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-image-slider-response-response').dispatchEvent(new Event('click'))
        document.querySelector('#jspsych-image-slider-response-response').value = getRandomInt(trial.min, trial.max)
        document.querySelector('#jspsych-image-slider-response-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'instructions') {
    plugin.simulate = function(trial) {
      for (var page_num = 1; page_num <= trial.pages.length; page_num++) {
        if (trial.allow_keys) {
          jsPsych.pluginAPI.setTimeout(function(){
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: trial.key_forward}));
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: trial.key_forward}))
          }, trial.simulate_response_time * page_num)
        }
        else if (trial.show_clickable_nav) {
          jsPsych.pluginAPI.setTimeout(function(){
            document.querySelector('#jspsych-instructions-next').dispatchEvent(new Event('click'));
          }, trial.simulate_response_time * page_num)
        }
      }
    }
  }
  else if (trial_type === 'maxdiff') {
    plugin.simulate = function(trial) {
      const left_right_randomized = jsPsych.randomization.shuffle(['left', 'right'])

      // split based on how many options are presented
      if (trial.alternatives.length < 2) {
        // sometimes do not select anything from the options if there is only one option as this is possible for a true participant
        const select_bool = jsPsych.randomization.sampleWithoutReplacement([true, false], 1)[0]
        if (select_bool) {
          document.querySelector('[name="'+left_right_randomized[0]+'"][data-name="0"').checked = true
        }
      } else {
        // for the ES6 lambda func below...
        // ...see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#using_arrow_functions_and_array.from
        // if trial.alternatives.length is 5, then array is [0, 1, 2, 3, 4]
        const opts_length_as_arr = Array.from({length: trial.alternatives.length}, (v, k) => k)
        const index_of_opts_to_select = jsPsych.randomization.sampleWithoutReplacement(opts_length_as_arr, 2)
        document.querySelector('[name="'+left_right_randomized[0]+'"][data-name="'+index_of_opts_to_select[0]+'"]').checked = true
        document.querySelector('[name="'+left_right_randomized[1]+'"][data-name="'+index_of_opts_to_select[1]+'"]').checked = true
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-maxdiff-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'rdk') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'reconstruction') {
    plugin.simulate = function(trial) {
      // finding out what the key_increase and key_decrease are, while
      // handling all sort of weird variations of key_increase and key_decrease below -- most are unlikely but still weird edge cases
      let valid_key_increase
      let valid_key_decrease
      if (trial.key_increase === jsPsych.ALL_KEYS && trial.key_decrease === jsPsych.NO_KEYS) {
        valid_key_increase = jsPsych.randomization.sampleWithoutReplacement(valid_keys_for_all_keys_option, 1)[0]
        valid_key_decrease = ''
      } else if (trial.key_increase === jsPsych.NO_KEYS && trial.key_decrease === jsPsych.ALL_KEYS) {
        valid_key_increase = ''
        valid_key_decrease = jsPsych.randomization.sampleWithoutReplacement(valid_keys_for_all_keys_option, 1)[0]
      } else if (trial.key_increase === jsPsych.NO_KEYS && (trial.key_decrease !== jsPsych.ALL_KEYS && trial.key_decrease !== jsPsych.NO_KEYS)) {
        valid_key_increase = ''
        valid_key_decrease = trial.trial.key_decrease
      } else if ((trial.key_increase !== jsPsych.ALL_KEYS && trial.key_increase !== jsPsych.NO_KEYS) && trial.key_decrease === jsPsych.NO_KEYS) {
        valid_key_increase = trial.trial.key_decrease
        valid_key_decrease = ''
      } else if ((trial.key_increase !== jsPsych.ALL_KEYS && trial.key_increase !== jsPsych.NO_KEYS) && 
                  (trial.key_decrease !== jsPsych.ALL_KEYS && trial.key_decrease !== jsPsych.NO_KEYS)) {
        valid_key_increase = trial.key_increase
        valid_key_decrease = trial.key_decrease
      } else {
        console.warn('Incompatible select of increase-decrease keys for reconstruction trial. Key increase was selected as '+trial.key_increase+' and key for decrease was selected as '+trial.key_decrease)
      }

      // get a list of key presses to execute - up to 10 of each increase/decrease in a random order; then execute them
      var current_presses_to_execute = []
      if (valid_key_increase.length > 0) {
        const number_of_key_increase_to_execute = Math.floor(Math.random() * 10) // up to 10
        for (i=0; i<number_of_key_increase_to_execute; i++) {
          current_presses_to_execute.push(valid_key_increase)
        }
      }
      if (valid_key_decrease.length > 0) {
        let number_of_key_decrease_to_execute = Math.floor(Math.random() * 10) // up to 10
        for (i=0; i<number_of_key_decrease_to_execute; i++) {
          current_presses_to_execute.push(valid_key_decrease)
        }
      }
      current_presses_to_execute = jsPsych.randomization.shuffle(current_presses_to_execute)
      for (key_press of current_presses_to_execute) {
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_press}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_press}));
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-reconstruction-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'resize') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-resize-btn').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'same-different-html') {
    plugin.simulate = function(trial) {
      const valid_keys = [trial.same_key, trial.different_key]
      const key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.first_stim_duration + trial.gap_duration + trial.second_stim_duration + trial.simulate_response_time);
    }
  }
  else if (trial_type === 'same-different-image') {
    plugin.simulate = function(trial) {
      const valid_keys = [trial.same_key, trial.different_key]
      const key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.first_stim_duration + trial.gap_duration + trial.second_stim_duration + trial.simulate_response_time);
    }
  }
  else if (trial_type === 'serial-reaction-time-mouse') {
    plugin.simulate = function(trial) {
      let row, col
      if (trial.allow_nontarget_responses === true) {
        // get random row-col positions
        row = Math.floor(Math.random() * trial.grid.length)
        col = Math.floor(Math.random() * trial.grid[row].length)
      } else {
        row = trial.target[0]
        col = trial.target[1]
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+row+'-'+col).dispatchEvent(new Event('mousedown'));
      }, trial.pre_target_duration + trial.simulate_response_time);
    }
  }
  else if (trial_type === 'serial-reaction-time') {
    plugin.simulate = function(trial) {
      const valid_keys = jsPsych.utils.flatten(trial.choices);
      const key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.pre_target_duration + trial.simulate_response_time);
    }
  }
  else if (trial_type === 'survey-html-form') {
    plugin.simulate = function(trial) {
      input_fields = document.getElementById('jspsych-survey-html-form').querySelectorAll('input')
      for (curr_input_field of input_fields) {
        if (curr_input_field.type !== 'submit') {
          curr_input_field.value = get_random_text()
        }
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-survey-html-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'survey-likert') {
    plugin.simulate = function(trial) {
      for (var question_index=0; question_index < trial.questions.length; question_index++) {
        const questions_opts_length = trial.questions[question_index].labels.length
        const random_opt = Math.floor(Math.random() * questions_opts_length) 
        document.querySelector('[name="Q'+question_index+'"][value="'+random_opt+'"]').checked = true
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-survey-likert-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'survey-multi-choice') {
    plugin.simulate = function(trial) {
      for (var question_index=0; question_index < trial.questions.length; question_index++) {
        const questions_opts_length = trial.questions[question_index].options.length
        const random_opt = Math.floor(Math.random() * questions_opts_length) 
        document.querySelector('#jspsych-survey-multi-choice-response-'+question_index+'-'+random_opt).checked = true
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-survey-multi-choice-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'survey-multi-select') {
    plugin.simulate = function(trial) {
      for (var question_index=0; question_index < trial.questions.length; question_index++) {        
        const opts_length = trial.questions[question_index].options.length
        // for the ES6 lambda func below...
        // ...see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#using_arrow_functions_and_array.from
        // if opts_length is 5, then array is [0, 1, 2, 3, 4]
        const opts_length_as_arr = Array.from({length: opts_length}, (v, k) => k)
        let number_of_opts_to_select = Math.floor(Math.random() * opts_length) 
        if (trial.questions[question_index].required === true && number_of_opts_to_select === 0) {
          // if a response is required but the random options to select is chosen as 0, just select 1 
          // another solutions would be to create a recursive loop to select non-zero number of opts
          number_of_opts_to_select += 1
        }

        const index_of_opts_to_select = jsPsych.randomization.sampleWithoutReplacement(opts_length_as_arr, number_of_opts_to_select)
        for (select_opt_ind of index_of_opts_to_select) {
          document.querySelector('#jspsych-survey-multi-select-response-'+question_index+'-'+select_opt_ind).checked = true
        }      
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-survey-multi-select-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'survey-text') {
    plugin.simulate = function(trial) {
      for (var question_index=0; question_index < trial.questions.length; question_index++) {
        document.querySelector('#input-' + question_index).value = get_random_text()
      }

      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('#jspsych-survey-text-form').dispatchEvent(new Event('submit'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'video-button-response') {
    plugin.simulate = function(trial) {
      if (trial.choices !== []) { // this if is most likely not possible and hence can be removed
        var choice = Math.floor(Math.random() * trial.choices.length).toString() // from the buttons, get a random data-choice label
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-video-button-response-button-' + choice).dispatchEvent(new Event('click'));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'video-keyboard-response') {
    plugin.simulate = function(trial) {
      if(trial.choices !== jsPsych.NO_KEYS) {
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
        jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
          document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
        }, trial.simulate_response_time);
      }
    }
  }
  else if (trial_type === 'video-slider-response') {
    plugin.simulate = function(trial) {
      jsPsych.pluginAPI.setTimeout(function(){
          document.querySelector('#jspsych-video-slider-response-response').dispatchEvent(new Event('click'))
          document.querySelector('#jspsych-video-slider-response-response').value = getRandomInt(trial.min, trial.max)
          document.querySelector('#jspsych-video-slider-response-next').dispatchEvent(new Event('click'));
      }, trial.simulate_response_time);
    }
  }
  else if (trial_type === 'visual-search-circle') {
    plugin.simulate = function(trial) {
      // finding out what the key_target_present and key_target_absent are, while
      // handling all sort of weird variations below -- most are unlikely but still weird edge cases
      let valid_key_target_present
      let valid_key_target_absent
      // handling all sort of weird variations below -- most are unlikely but still weird edge cases
      if (trial.target_present_key === jsPsych.ALL_KEYS && trial.target_absent_key === jsPsych.NO_KEYS) {
        valid_key_target_present = jsPsych.randomization.sampleWithoutReplacement(valid_keys_for_all_keys_option, 1)[0]
        valid_key_target_absent = ''
      } else if (trial.target_present_key === jsPsych.NO_KEYS && trial.target_absent_key === jsPsych.ALL_KEYS) {
        valid_key_target_present = ''
        valid_key_target_absent = jsPsych.randomization.sampleWithoutReplacement(valid_keys_for_all_keys_option, 1)[0]
      } else if (trial.target_present_key === jsPsych.NO_KEYS && (trial.target_absent_key !== jsPsych.ALL_KEYS && trial.target_absent_key !== jsPsych.NO_KEYS)) {
        valid_key_target_present = ''
        valid_key_target_absent = trial.trial.target_absent_key
      } else if ((trial.target_present_key !== jsPsych.ALL_KEYS && trial.target_present_key !== jsPsych.NO_KEYS) && trial.target_absent_key === jsPsych.NO_KEYS) {
        valid_key_target_present = trial.trial.target_absent_key
        valid_key_target_absent = ''
      } else if ((trial.target_present_key !== jsPsych.ALL_KEYS && trial.target_present_key !== jsPsych.NO_KEYS) && 
                  (trial.target_absent_key !== jsPsych.ALL_KEYS && trial.target_absent_key !== jsPsych.NO_KEYS)) {
        valid_key_target_present = trial.target_present_key
        valid_key_target_absent = trial.target_absent_key
      } else {
        console.warn('Incompatible select of increase-decrease keys for reconstruction trial. Key increase was selected as '+trial.target_present_key+' and key for decrease was selected as '+trial.target_absent_key)
      }

      const key_response = jsPsych.randomization.sampleWithoutReplacement([valid_key_target_present, valid_key_target_absent], 1)[0]
      jsPsych.pluginAPI.setTimeout(function(){
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
        document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
      }, trial.fixation_duration + trial.simulate_response_time);
    }
  }
  else if (trial_type === 'vsl-animate-occlusion') {
    plugin.simulate = function(trial) {
      // make sure it's at least 20 as below, there is a +10 offset
      if (trial.simulate_response_time < 20) {
        console.warning('The simulation response time for the vsl-animate-occlusion trial is set to less than 20. Errors in the data are likely to occur. Please set to 20 or above.')
      }
      if (trial.choices !== jsPsych.NO_KEYS) {
        // simulate key press for every stimulus; no other event needed as the trial will end whenever all stimuli are displayed
        const valid_keys = trial.choices === jsPsych.ALL_KEYS ? valid_keys_for_all_keys_option : trial.choices
        for (var trial_stim_ind=0; trial_stim_ind<trial.stimuli.length; trial_stim_ind++) {
          var key_response = jsPsych.randomization.sampleWithoutReplacement(valid_keys, 1)[0];
          jsPsych.pluginAPI.setTimeout(function(){
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key_response}));
            document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key_response}));
            // +10 for a small offset to ensure this is done correctly.
          }, trial.pre_movement_duration + (trial.simulate_response_time)*trial_stim_ind + 10); 
        }
      }
    }
  }
  else if (trial_type === 'vsl-grid-scene') {
    plugin.simulate = function(trial) {
      // this is a valid trial for simulation but no need to do anything as trial_duration determines length of trial and this is handled within the core
    }
  }

  return plugin
}

// these are simply all the keys of the 'keylookup' object in the jsPsych.pluginAPI
// defined here as the keylookup is not exposed to the global namespace and hence cannot be used
// an alternative solution would involve exposing the keylookup
// benefit: more fleixble for the simulation method, cost: accidental overwriting by users
const valid_keys_for_all_keys_option = ['backspace','tab','enter','shift','ctrl','alt','pause','capslock','esc','space','spacebar',' ','pageup','pagedown','end','home','leftarrow','uparrow','rightarrow','downarrow','insert','delete','0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0numpad','1numpad','2numpad','3numpad','4numpad','5numpad','6numpad','7numpad','8numpad','9numpad','multiply','plus','minus','decimal','divide','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12','=',',','.','/','`','[','\\',']',]

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_random_text() {
  // weird way to produce text but works, see https://gist.github.com/6174/6062387
  // could change to generating lorem ipsum instead (as in qualtrics), e.g. https://www.npmjs.com/package/lorem-ipsum
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2, 11); // 20 characters
}
