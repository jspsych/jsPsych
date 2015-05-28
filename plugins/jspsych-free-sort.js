/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */

(function($) {
    jsPsych['free-sort'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            //params = jsPsych.pluginAPI.enforceArray(params, ['data']);

            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    "images": params.stimuli[i], // array of images to display
                    "stim_height": params.stim_height || 100,
                    "stim_width": params.stim_width || 100,
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial,
                    "prompt": (typeof params.prompt === 'undefined') ? '' : params.prompt,
                    "prompt_location": params.prompt_location || "above",
                    "sort_area_width": params.sort_area_width || 800,
                    "sort_area_height": params.sort_area_height || 800
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

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

            for (var i = 0; i < trial.images.length; i++) {
                var coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height - trial.stim_height);

                $("#jspsych-free-sort-arena").append($('<img>', {
                    "src": trial.images[i],
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
                    "src": trial.images[i],
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
                "class": "jspsych-free-sort",
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

                    jsPsych.data.write({
                        "init_locations": JSON.stringify(init_locations),
                        "moves": JSON.stringify(moves),
                        "final_locations": JSON.stringify(final_locations),
                        "rt": rt
                    });

                    // advance to next part
                    display_element.html("");
                    jsPsych.finishTrial();
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
})(jQuery);
