/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-sort'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default values
    trial.stim_height = trial.stim_height || 100;
    trial.stim_width = trial.stim_width || 100;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
    trial.prompt_location = trial.prompt_location || "above";
    trial.sort_area_width = trial.sort_area_width || 800;
    trial.sort_area_height = trial.sort_area_height || 800;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var start_time = (new Date()).getTime();

    // check if there is a prompt and if it is shown above
    if (trial.prompt && trial.prompt_location == "above") {
      display_element.append(trial.prompt);
    }

    display_element.append($('<div>', {
      "id": "jspsych-free-sort-arena",
      "class": "jspsych-free-sort-arena",
      "css": {
        "position": "relative",
        "width": trial.sort_area_width,
        "height": trial.sort_area_height
      }
    }));

    // check if prompt exists and if it is shown below
    if (trial.prompt && trial.prompt_location == "below") {
      display_element.append(trial.prompt);
    }

    // store initial location data
    var init_locations = [];

    for (var i = 0; i < trial.stimuli.length; i++) {
      var coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height - trial.stim_height);

      $("#jspsych-free-sort-arena").append($('<img>', {
        "src": trial.stimuli[i],
        "class": "jspsych-free-sort-draggable",
        "css": {
          "position": "absolute",
          "top": coords.y,
          "left": coords.x,
          "width": trial.stim_width,
          "height": trial.stim_height
        }
      }));

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
    }

    var moves = [];

    $('.jspsych-free-sort-draggable').draggable({
      containment: "#jspsych-free-sort-arena",
      scroll: false,
      stack: ".jspsych-free-sort-draggable",
      stop: function(event, ui) {
        moves.push({
          "src": event.target.src.split("/").slice(-1)[0],
          "x": ui.position.left,
          "y": ui.position.top
        });
      }
    });

    display_element.append($('<button>', {
      "id": "jspsych-free-sort-done-btn",
      "class": "jspsych-btn jspsych-free-sort",
      "html": "Done",
      "click": function() {
        var end_time = (new Date()).getTime();
        var rt = end_time - start_time;
        // gather data
        // get final position of all objects
        var final_locations = [];
        $('.jspsych-free-sort-draggable').each(function() {
          final_locations.push({
            "src": $(this).attr('src'),
            "x": $(this).css('left'),
            "y": $(this).css('top')
          });
        });

        var trial_data = {
          "init_locations": JSON.stringify(init_locations),
          "moves": JSON.stringify(moves),
          "final_locations": JSON.stringify(final_locations),
          "rt": rt
        };

        // advance to next part
        display_element.html("");
        jsPsych.finishTrial(trial_data);
      }
    }));

  };

  // helper functions

  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  return plugin;
})();
