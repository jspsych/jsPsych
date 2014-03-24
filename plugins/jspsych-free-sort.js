/**
 * Josh de Leeuw
 * Updated October 2013
 * 
 * This plugin displays a set of images on the screen and allows the user to drag them around.
 * The location of each object and the moves that the subject performs are recorded.
 * 
 * parameters:
 *      stimuli: array of arrays. inner most arrays are collections of image paths that will be displayed in a trial. outer
 *                  arrays are trials.
 *      stim_height: the height of the images to sort in pixels.
 *      stim_width: the width of the images to sort in pixels.
 *      timing_post_trial: how long to show a blank screen after the trial in ms.
 *      prompt: optional html string to display while sorting happens.
 *      prompt_location: either 'above' or 'below'; changes location of prompt
 *      sort_area_width: width of the area used to sort the images
 *      sort_area_height: height of the area used to sort the images
 *      data: optional data object
 * 
 */

(function($) {
    jsPsych['free-sort'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    "type": "free-sort",
                    "images": params.stimuli[i], // array of images to display
                    "stim_height": params.stim_height || 100,
                    "stim_width": params.stim_width || 100,
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial,
                    "prompt": (typeof params.prompt === 'undefined') ? '' : params.prompt,
                    "prompt_location": params.prompt_location || "above",
                    "sort_area_width": params.sort_area_width || 800,
                    "sort_area_height": params.sort_area_height || 800,
                    "data": (typeof params.data === 'undefined') ? {} : params.data[i]
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.normalizeTrialVariables(trial);

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
                        "left": coords.x
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

                    block.writeData($.extend({}, {
                        "init_locations": JSON.stringify(init_locations),
                        "moves": JSON.stringify(moves),
                        "final_locations": JSON.stringify(final_locations),
                        "rt": rt
                    }, trial.data));

                    // advance to next part
                    display_element.html("");
                    if (trial.timing_post_trial > 0) {
                        setTimeout(function() {
                            block.next();
                        }, trial.timing_post_trial);
                    }
                    else {
                        block.next();
                    }
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
