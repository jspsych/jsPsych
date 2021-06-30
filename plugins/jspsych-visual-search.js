/**
 *
 * jspsych-visual-search
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["visual-search"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search', 'target', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search', 'foil', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search', 'fixation_image', 'image');

  plugin.info = {
    name: 'visual-search',
    description: '',
    parameters: {
      usegrid: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Use grid',
        default: false,
        description: 'Place items on a grid?'
      },
      jitter_ratio: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'jitter',
        default: 0.0,
        description: 'The distance to jitter the image as ratio of image size (average of x and y).'
      },
      target: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Target',
        default: undefined,
        description: 'The image to be displayed.'
      },
      foil: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Foil',
        default: undefined,
        description: 'Path to image file that is the foil/distractor.'
      },
      fixation_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Fixation image',
        default: undefined,
        description: 'Path to image file that is a fixation target.'
      },
      set_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Set size',
        default: undefined,
        description: 'How many items should be displayed?'
      },
      target_present: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Target present',
        default: true,
        description: 'Is the target present?'
      },
      target_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target size',
        array: true,
        default: [50, 50],
        description: 'Two element array indicating the height and width of the search array element images.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [16, 16],
        description: 'Two element array indicating the height and width of the fixation image.'
      },
      circle_diameter: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle diameter',
        default: 500,
        description: 'The diameter of the search array circle in pixels.'
      },
      target_present_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Target present key',
        default: 'j',
        description: 'The key to press if the target is present in the search array.'
      },
      target_absent_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Target absent key',
        default: 'f',
        description: 'The key to press if the target is not present in the search array.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: 1000,
        description: 'How long to show the fixation image for before the search array (in milliseconds).'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    const jitter = ((stimh + stimw) / 2) * trial.jitter_ratio
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // fixation location
    var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0] / 2), Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)];
    
    var possible_display_locs = trial.set_size;  
     
    let display_locs = [];

    if (trial.usegrid) {

      const num_pos = Math.ceil(Math.sqrt(possible_display_locs))
      //square root the number of possible display locations

      const step = 2 / (num_pos - 1)
      //distance between each location
      console.log(step, num_pos)

      let full_locs = []
      for (let x = -1; x <= 1; x+=step) {
        //x is between -1 and 1, increase by value of step each time
        for (let y = -1; y <= 1; y+=step) {
          //y is between -1 and 1, increase by value of step each time
          full_locs.push([
            Math.floor(paper_size / 2 + (x * radi) - hstimw),
            //x coord
            Math.floor(paper_size / 2 + (y * radi) - hstimh)
            //y coord
          ]);
        }
      }

      full_locs = shuffle(full_locs)
      display_locs = full_locs.slice(0, possible_display_locs);

      for (let i=0; i < display_locs.length; i++) {
        let random_angle = Math.floor(Math.random() * 360);
        let rand_x = Math.floor(cosd(random_angle) * jitter)
        let rand_y = Math.floor(sind(random_angle) * jitter)
        display_locs[i][0] += rand_x 
        display_locs[i][1] += rand_y
      }

    } else {

      // possible stimulus locations on the circle
      var random_offset = Math.floor(Math.random() * 360);
      for (var i = 0; i < possible_display_locs; i++) {
        let vec_jitter = Math.sign(Math.random() * 2 - 1) * jitter
        display_locs.push([
          Math.floor(paper_size / 2 + (cosd(random_offset + (i * (360 / possible_display_locs))) * (radi + vec_jitter)) - hstimw),
          Math.floor(paper_size / 2 - (sind(random_offset + (i * (360 / possible_display_locs))) * (radi + vec_jitter)) - hstimh)
        ]);
      }
    }

    // get target to draw on
    display_element.innerHTML += '<div id="jspsych-visual-search-container" style="position: relative; width:' + paper_size + 'px; height:' + paper_size + 'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-container");

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
      //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
      paper.innerHTML += "<img src='"+trial.fixation_image+"' style='position: absolute; top:"+fix_loc[0]+"px; left:"+fix_loc[1]+"px; width:"+trial.fixation_size[0]+"px; height:"+trial.fixation_size[1]+"px;'></img>";

      // wait
      jsPsych.pluginAPI.setTimeout(function() {
        // after wait is over
        show_search_array();
        paper.innerHTML += "<img src='"+trial.fixation_image+"' style='position: absolute; top:"+fix_loc[0]+"px; left:"+fix_loc[1]+"px; width:"+trial.fixation_size[0]+"px; height:"+trial.fixation_size[1]+"px;'></img>";
      }, trial.fixation_duration);
    }

    function show_search_array() {

      var search_array_images = [];

      var to_present = [];
      if(trial.target_present){
        to_present.push(trial.target);
      }
      to_present = to_present.concat(trial.foil);

      for (var i = 0; i < display_locs.length; i++) {

        paper.innerHTML += "<img src='"+to_present[i]+"' style='position: absolute; top:"+display_locs[i][0]+"px; left:"+display_locs[i][1]+"px; width:"+trial.target_size[0]+"px; height:"+trial.target_size[1]+"px;'></img>";

      }

      var trial_over = false;

      var after_response = function(info) {

        trial_over = true;

        var correct = false;

        if ((jsPsych.pluginAPI.compareKeys(info.key, trial.target_present_key)) && trial.target_present ||
            (jsPsych.pluginAPI.compareKeys(info.key, trial.target_absent_key)) && !trial.target_present) {
          correct = true;
        }

        clear_display();

        end_trial(info.rt, correct, info.key);

      }

      var valid_keys = [trial.target_present_key, trial.target_absent_key];

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      if (trial.trial_duration !== null) {

        jsPsych.pluginAPI.setTimeout(function() {

          if (!trial_over) {

            jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

            trial_over = true;

            var rt = null;
            var correct = 0;
            var key_press = null;

            clear_display();

            end_trial(rt, correct, key_press);
          }
        }, trial.trial_duration);

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
        response: key_press,
        locations: display_locs,
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

  // shuffle any input array
  function shuffle(array) {
    // define three variables
    let cur_idx = array.length, tmp_val, rand_idx;

    // While there remain elements to shuffle...
    while (0 !== cur_idx) {
      // Pick a remaining element...
      rand_idx = Math.floor(Math.random() * cur_idx);
      cur_idx -= 1;

      // And swap it with the current element.
      tmp_val = array[cur_idx];
      array[cur_idx] = array[rand_idx];
      array[rand_idx] = tmp_val;
    }
    return array;
  }
  
  return plugin;
})();
