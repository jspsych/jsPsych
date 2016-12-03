/**
 *
 * jspsych-visual-search-circle
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * requires Snap.svg library (snapsvg.io)
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["visual-search-circle"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'target', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'foil', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'fixation_image', 'image');

  plugin.info = {
    name: 'visual-search-circle',
    description: '',
    parameters: {
      target: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      foil: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      fixation_image: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      set_size: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        no_function: false,
        description: ''
      },
      target_present: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      target_size: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: 50,
        no_function: false,
        description: ''
      },
      fixation_size: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: 16,
        no_function: false,
        description: ''
      },
      circle_diameter: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 250,
        no_function: false,
        description: ''
      },
      target_present_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'j',
        no_function: false,
        description: ''
      },
      target_absent_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'f',
        no_function: false,
        description: ''
      },
      timing_max_search: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      timing_fixation: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default values
    trial.target_size = trial.target_size || [50, 50];
    trial.fixation_size = trial.fixation_size || [16, 16];
    trial.circle_diameter = trial.circle_diameter || 250;
    trial.target_present_key = trial.target_present_key || 74;
    trial.target_absent_key = trial.target_absent_key || 70;
    trial.timing_max_search = (typeof trial.timing_max_search === 'undefined') ? -1 : trial.timing_max_search;
    trial.timing_fixation = (typeof trial.timing_fixation === 'undefined') ? 1000 : trial.timing_fixation;

    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // screen information
    var screenw = display_element.width();
    var screenh = display_element.height();
    var centerx = screenw / 2;
    var centery = screenh / 2;

    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // fixation location
    var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0] / 2), Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)];

    // possible stimulus locations on the circle
    var display_locs = [];
    var possible_display_locs = trial.set_size;
    var random_offset = Math.floor(Math.random() * 360);
    for (var i = 0; i < possible_display_locs; i++) {
      display_locs.push([
        Math.floor(paper_size / 2 + (cosd(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimw),
        Math.floor(paper_size / 2 - (sind(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimh)
      ]);
    }

    // get target to draw on
    display_element.innerHTML += '<svg id="jspsych-visual-search-circle-svg" width=' + paper_size + ' height=' + paper_size + '></svg>';
    var paper = Snap('#jspsych-visual-search-circle-svg');

    // check distractors - array?
    if(!Array.isArray(trial.foil)){
      fa = [];
      for(var i=0; i<trial.set_size; i++){
        fa.push(trial.foil);
      }
      trial.foil = fa;
    }

    show_fixation();

    function show_fixation() {
      // show fixation
      var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);

      // wait
      jsPsych.pluginAPI.setTimeout(function() {
        // after wait is over
        show_search_array();
      }, trial.timing_fixation);
    }

    function show_search_array() {

      var search_array_images = [];

      var to_present = [];
      if(trial.target_present){
        to_present.push(trial.target);
      }
      to_present = to_present.concat(trial.foil);

      for (var i = 0; i < display_locs.length; i++) {

        var img = paper.image(to_present[i], display_locs[i][0], display_locs[i][1], trial.target_size[0], trial.target_size[1]);

        search_array_images.push(img);

      }

      var trial_over = false;

      var after_response = function(info) {

        trial_over = true;

        var correct = 0;

        if (info.key == trial.target_present_key && trial.target_present ||
          info.key == trial.target_absent_key && !trial.target_present) {
          correct = 1;
        }

        clear_display();

        end_trial(info.rt, correct, info.key);

      }

      var valid_keys = [trial.target_present_key, trial.target_absent_key];

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });

      if (trial.timing_max_search > -1) {

        if (trial.timing_max_search == 0) {
          if (!trial_over) {

            jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

            trial_over = true;

            var rt = -1;
            var correct = 0;
            var key_press = -1;

            clear_display();

            end_trial(rt, correct, key_press);
          }
        } else {

          jsPsych.pluginAPI.setTimeout(function() {

            if (!trial_over) {

              jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

              trial_over = true;

              var rt = -1;
              var correct = 0;
              var key_press = -1;

              clear_display();

              end_trial(rt, correct, key_press);
            }
          }, trial.timing_max_search);
        }
      }

      function clear_display() {
        display_element.innerHTML = '';
      }
    }


    function end_trial(rt, correct, key_press) {

      // data saving
      var trial_data = {
        correct: correct,
        rt: rt,
        key_press: key_press,
        locations: JSON.stringify(display_locs),
        target_present: trial.target_present,
        set_size: trial.set_size
      };

      // go to next trial
      jsPsych.finishTrial(trial_data);
    }
  };

  // helper function for determining stimulus locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }

  return plugin;
})();
