/**
 * jsPsych plugin for showing scenes that mimic the experiments described in
 * 
 * Fiser, J., & Aslin, R. N. (2001). Unsupervised statistical learning of 
 * higher-order spatial structures from visual scenes. Psychological science, 
 * 12(6), 499-504.
 * 
 * Josh de Leeuw
 * February 2014
 * 
 * 
 * parameters:
 *      stimuli: array of arrays describing scenes. each interior array should have dimensions
 *          equal to the size of the desired grid. for example, a 3 x 3 grid  with stimuli along
 *          the top-left to bottom-right diagonal would be declared like this:
 * 
 *              var s = [
 *                  [ "img_path", 0, 0 ],
 *                  [ 0, "img_path", 0 ],
 *                  [ 0, 0, "img_path" ]
 *              ]
 * 
 *          for blank spaces in the grid, you need to put a 0 in the corresponding location. 
 *      image_size: array [width, height] - how big to draw the stimuli
 *      timing_duration: how long to show the scene
 *      timing_post_trial: how long to show blank screen after trial
 *      data: the optional data object
 * 
 */

(function($) {
    jsPsych['vsl-grid-scene'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "vsl-grid-scene";
                trials[i].stimuli = params.stimuli[i];
                trials[i].image_size = params.image_size || [100, 100];
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                trials[i].timing_duration = (typeof params.timing_duration === 'undefined') ? 2000 : params.timing_duration;
                //trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data;
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            var nrows = trial.stimuli.length;
            var ncols = trial.stimuli[0].length;

            // create table
            display_element.append($('<table>', {
                id: 'jspsych-vsl-grid-scene-table',
                css: {
                    'border-collapse': 'collapse'
                }
            }));

            for (var row = 0; row < nrows; row++) {
                $("#jspsych-vsl-grid-scene-table").append($('<tr>', {
                    id: 'jspsych-vsl-grid-scene-table-row-' + row,
                    css: {
                        height: trial.image_size[1] + "px"
                    }
                }));
                for (var col = 0; col < ncols; col++) {
                    $("#jspsych-vsl-grid-scene-table-row-" + row).append($('<td>', {
                        id: 'jspsych-vsl-grid-scene-table-' + row + '-' + col,
                        css: {
                            width: trial.image_size[0] + "px",
                            border: '1px solid #555',
                            padding: trial.image_size[1] / 10 + "px " + trial.image_size[0] / 10 + "px"
                        }
                    }));
                }
            }

            function fill_table(pattern) {
                for (var row = 0; row < nrows; row++) {
                    for (var col = 0; col < ncols; col++) {
                        if (pattern[row][col] !== 0) {
                            $('#jspsych-vsl-grid-scene-table-' + row + '-' + col).append($('<img>', {
                                src: pattern[row][col],
                                css: {
                                    width: trial.image_size[0] + "px",
                                    height: trial.image_size[1] + "px",
                                }
                            }));
                        }
                    }
                }
            }

            fill_table(trial.stimuli);
            
            setTimeout(function(){ endTrial(); }, trial.timing_duration);

            function endTrial() {

                display_element.html('');

                block.writeData($.extend({}, {
                    "trial_type": "vsl-grid-scene",
                    "trial_index": block.trial_idx,
                    "stimuli": JSON.stringify(trial.stimuli)
                }, trial.data));

                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                }
            }
        };

        return plugin;
    })();
})(jQuery);
