/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 *
 */

(function($) {
  jsPsych.instructions = (function() {

    var plugin = {};

    plugin.create = function(params) {

      params = jsPsych.pluginAPI.enforceArray(params, ['pages']);

      var trials = new Array(1);

      trials[0] = {};
      trials[0].pages = params.pages;
      trials[0].key_forward = params.key_forward || 'rightarrow';
      trials[0].key_backward = params.key_backward || 'leftarrow';
      trials[0].allow_backward = (typeof params.allow_backward === 'undefined') ? true : params.allow_backward;
      trials[0].allow_keys = (typeof params.allow_keys === 'undefined') ? true : params.allow_keys;
      trials[0].show_clickable_nav = (typeof params.show_clickable_nav === 'undefined') ? false : params.show_clickable_nav;

      return trials;
    };

    plugin.trial = function(display_element, trial) {

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      var current_page = 0;

      var view_history = [];

      var start_time = (new Date()).getTime();

      var last_page_update_time = start_time;

      function show_current_page() {
        display_element.html(trial.pages[current_page]);

        if (trial.show_clickable_nav) {

          var nav_html = "<div class='jspsych-instructions-nav'>";
          if (current_page != 0 && trial.allow_backward) {
            nav_html += "<button id='jspsych-instructions-back'>&lt; Previous</button>";
          }
          nav_html += "<button id='jspsych-instructions-next'>Next &gt;</button></div>"

          display_element.append(nav_html);

          if (current_page != 0 && trial.allow_backward) {
            $('#jspsych-instructions-back').on('click', function() {
              clear_button_handlers();
              back();
            });
          }

          $('#jspsych-instructions-next').on('click', function() {
            clear_button_handlers();
            next();
          });

        }
      }

      function clear_button_handlers() {
        $('#jspsych-instructions-next').off('click');
        $('#jspsych-instructions-back').off('click');
      }

      function next() {

        add_current_page_to_view_history()

        current_page++;

        // if done, finish up...
        if (current_page >= trial.pages.length) {
          endTrial();
        } else {
          show_current_page();
        }

      }

      function back() {

        add_current_page_to_view_history()

        current_page--;

        show_current_page();
      }

      function add_current_page_to_view_history() {

        var current_time = (new Date()).getTime();

        var page_view_time = current_time - last_page_update_time;

        view_history.push({
          page_index: current_page,
          viewing_time: page_view_time
        });

        last_page_update_time = current_time;
      }

      function endTrial() {

        if (trial.allow_keys) {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
        }

        display_element.html('');

        jsPsych.data.write({
          "view_history": JSON.stringify(view_history),
          "rt": (new Date()).getTime() - start_time
        });

        jsPsych.finishTrial();
      }

      var after_response = function(info) {

        // have to reinitialize this instead of letting it persist to prevent accidental skips of pages by holding down keys too long
        keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.key_forward, trial.key_backward],
          rt_method: 'date',
          persist: false,
          allow_held_key: false
        });
        // check if key is forwards or backwards and update page
        if (info.key === trial.key_backward || info.key === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_backward)) {
          if (current_page !== 0 && trial.allow_backward) {
            back();
          }
        }

        if (info.key === trial.key_forward || info.key === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_forward)) {
          next();
        }

      };

      show_current_page();

      if (trial.allow_keys) {
        var keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.key_forward, trial.key_backward],
          rt_method: 'date',
          persist: false
        });
      }
    };

    return plugin;
  })();
})(jQuery);
