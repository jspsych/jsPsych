/**
 * jsPsych plugin for showing scenes that mimic the experiments described in
 *
 * Fiser, J., & Aslin, R. N. (2001). Unsupervised statistical learning of
 * higher-order spatial structures from visual scenes. Psychological science,
 * 12(6), 499-504.
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['vsl-grid-scene'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('vsl-grid-scene', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default parameter values
    trial.image_size = trial.image_size || [100, 100];
    trial.timing_duration = typeof trial.timing_duration === 'undefined' ? 2000 : trial.timing_duration;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    display_element.html(plugin.generate_stimulus(trial.stimuli, trial.image_size));

    setTimeout(function() {
      endTrial();
    }, trial.timing_duration);

    function endTrial() {

      display_element.html('');

      var trial_data = {
        "stimulus": JSON.stringify(trial.stimuli)
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  plugin.generate_stimulus = function(pattern, image_size) {
    var nrows = pattern.length;
    var ncols = pattern[0].length;

    // create blank element to hold code that we generate
    $('body').append($('<div>', {
      id: 'jspsych-vsl-grid-scene-dummy',
      css: {
        display: 'none'
      }
    }));

    // create table
    $('#jspsych-vsl-grid-scene-dummy').append($('<table>', {
      id: 'jspsych-vsl-grid-scene-table',
      css: {
        'border-collapse': 'collapse',
        'margin-left': 'auto',
        'margin-right': 'auto'
      }
    }));

    for (var row = 0; row < nrows; row++) {
      $("#jspsych-vsl-grid-scene-table").append($('<tr>', {
        id: 'jspsych-vsl-grid-scene-table-row-' + row,
        css: {
          height: image_size[1] + "px"
        }
      }));
      for (var col = 0; col < ncols; col++) {
        $("#jspsych-vsl-grid-scene-table-row-" + row).append($('<td>', {
          id: 'jspsych-vsl-grid-scene-table-' + row + '-' + col,
          css: {
            padding: image_size[1] / 10 + "px " + image_size[0] / 10 + "px",
            border: '1px solid #555'
          }
        }));
        $('#jspsych-vsl-grid-scene-table-' + row + '-' + col).append($('<div>', {
          id: 'jspsych-vsl-grid-scene-table-cell-' + row + '-' + col,
          css: {
            width: image_size[0] + "px",
            height: image_size[1] + "px"
          }
        }));
      }
    }


    for (var row = 0; row < nrows; row++) {
      for (var col = 0; col < ncols; col++) {
        if (pattern[row][col] !== 0) {
          $('#jspsych-vsl-grid-scene-table-cell-' + row + '-' + col).append($('<img>', {
            src: pattern[row][col],
            css: {
              width: image_size[0] + "px",
              height: image_size[1] + "px",
            }
          }));
        }
      }
    }

    var html_out = $('#jspsych-vsl-grid-scene-dummy').html();
    $('#jspsych-vsl-grid-scene-dummy').remove();

    return html_out;

  };

  return plugin;
})();
