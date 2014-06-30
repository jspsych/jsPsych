/** 
 * jspsych-palmer
 * Josh de Leeuw (October 2013)
 * 
 * a jspsych plugin for presenting and querying about stimuli modeled after
 *
 * Palmer, S. (1977). Hierarchical Structure in Perceptual Representation. Cognitive Psychology, 9, 441.
 *
 * and
 *
 * Goldstone, R. L., Rogosky, B. J., Pevtzow, R., & Blair, M. (2005). Perceptual and semantic reorganization during category learning. 
 * In H. Cohen & C. Lefebvre (Eds.) Handbook of Categorization in Cognitive Science. (pp. 651-678). Amsterdam: Elsevier.
 *
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-palmer
 *
 */

(function($) {
    jsPsych.palmer = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['data']);
            
            var trials = [];
            for (var i = 0; i < params.configurations.length; i++) {
                var trial = {
                    type: "palmer",
                    configurations: params.configurations[i],
                    editable: (typeof params.editable === 'undefined') ? false : params.editable,
                    show_feedback: (typeof params.show_feedback === 'undefined') ? false : params.show_feedback,
                    grid_spacing: params.grid_spacing || 75,
                    square_size: params.square_size || 3,
                    circle_radius: params.circle_radius || 20,
                    timing_item: params.timing_item || 1000,
                    timing_post_trial: (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial,
                    timing_feedback: params.timing_feedback || 1000,
                    prompt: (typeof params.prompt === 'undefined') ? "" : params.prompt,
                    data: (typeof params.data === 'undefined') ? {} : params.data[i]
                };

                trials.push(trial);
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

            // variables to keep track of user interaction
            var start_circle = -1;
            var end_circle = -1;
            var line_started = false;

            var size = trial.grid_spacing * (trial.square_size + 1);

            display_element.append($("<div id='jspsych-palmer-raphaelCanvas'>", {
                css: {
                    width: size + "px",
                    height: size + "px"
                }
            }));

            var paper = Raphael("jspsych-palmer-raphaelCanvas", size, size);

            // create the circles at the vertices.
            var circles = [];
            var node_idx = 0;
            for (var i = 1; i <= trial.square_size; i++) {
                for (var j = 1; j <= trial.square_size; j++) {
                    var circle = paper.circle(trial.grid_spacing * j, trial.grid_spacing * i, trial.circle_radius);
                    circle.attr("fill", "#000").attr("stroke-width", "0").attr("stroke", "#000").data("node", node_idx);

                    if (trial.editable) {
                        circle.hover(

                        function() {
                            this.attr("stroke-width", "2");
                            //this.attr("stroke", "#000");
                        },

                        function() {
                            this.attr("stroke-width", "0");
                            //this.attr("stroke", "#fff")
                        }).click(

                        function() {
                            if (!line_started) {
                                line_started = true;
                                start_circle = this.data("node");
                                this.attr("fill", "#777").attr("stroke", "#777");
                            }
                            else {
                                end_circle = this.data("node");
                                draw_connection(start_circle, end_circle);
                            }
                        });
                    }
                    node_idx++;
                    circles.push(circle);
                }
            }

            function draw_connection(start_circle, end_circle) {
                var the_line = getLineIndex(start_circle, end_circle);
                if (the_line > -1) {
                    toggle_line(the_line);
                }
                // reset highlighting on circles
                for (var i = 0; i < circles.length; i++) {
                    circles[i].attr("fill", "#000").attr("stroke", "#000");
                }
                // cleanup the variables
                line_started = false;
                start_circle = -1;
                end_circle = -1;
            }

            // create all possible lines that connect circles
            var horizontal_lines = [];
            var vertical_lines = [];
            var backslash_lines = [];
            var forwardslash_lines = [];

            for (var i = 0; i < trial.square_size; i++) {
                for (var j = 0; j < trial.square_size; j++) {
                    var current_item = (i * trial.square_size) + j;
                    // add horizontal connections
                    if (j < (trial.square_size - 1)) {
                        horizontal_lines.push([current_item, current_item + 1]);
                    }
                    // add vertical connections
                    if (i < (trial.square_size - 1)) {
                        vertical_lines.push([current_item, current_item + trial.square_size]);
                    }
                    // add diagonal backslash connections
                    if (i < (trial.square_size - 1) && j < (trial.square_size - 1)) {
                        backslash_lines.push([current_item, current_item + trial.square_size + 1]);
                    }
                    // add diagonal forwardslash connections
                    if (i < (trial.square_size - 1) && j > 0) {
                        forwardslash_lines.push([current_item, current_item + trial.square_size - 1]);
                    }
                }
            }

            var lines = horizontal_lines.concat(vertical_lines).concat(backslash_lines).concat(forwardslash_lines);

            // actually draw the lines
            var lineIsVisible = [];
            var lineElements = [];

            for (var i = 0; i < lines.length; i++) {
                var line = paper.path("M" + circles[lines[i][0]].attr("cx") + " " + circles[lines[i][0]].attr("cy") + "L" + circles[lines[i][1]].attr("cx") + " " + circles[lines[i][1]].attr("cy")).attr("stroke-width", "8").attr("stroke", "#000");
                line.hide();
                lineElements.push(line);
                lineIsVisible.push(0);
            }

            // define some helper functions to toggle lines on and off

            // this function gets the index of a line based on the two circles it connects
            function getLineIndex(start_circle, end_circle) {
                var the_line = -1;
                for (var i = 0; i < lines.length; i++) {
                    if ((start_circle == lines[i][0] && end_circle == lines[i][1]) || (start_circle == lines[i][1] && end_circle == lines[i][0])) {
                        the_line = i;
                        break;
                    }
                }
                return the_line;
            }

            // this function turns a line on/off based on the index (the_line)
            function toggle_line(the_line) {
                if (the_line > -1) {
                    if (lineIsVisible[the_line] === 0) {
                        lineElements[the_line].show();
                        lineElements[the_line].toBack();
                        lineIsVisible[the_line] = 1;
                    }
                    else {
                        lineElements[the_line].hide();
                        lineElements[the_line].toBack();
                        lineIsVisible[the_line] = 0;
                    }
                }
            }

            // this function takes an array of length = num lines, and displays the line whereever there
            // is a 1 in the array.
            function showConfiguration(configuration) {
                for (var i = 0; i < configuration.length; i++) {
                    if (configuration[i] != lineIsVisible[i]) {
                        toggle_line(i);
                    }
                }
            }

            // highlight a line
            function highlightLine(line) {
                lineElements[line].attr("stroke", "#f00");
            }

            // start recording the time
            var startTime = (new Date()).getTime();

            // what kind of trial are we doing?
            // if trial.editable is true, then we will let the user interact with the stimulus to create
            // something, e.g. for a reconstruction probe.
            // need a way for the user to submit when they are done in that case...
            if (trial.editable) {
                display_element.append($('<button id="jspsych-palmer-submitButton" type="button">Submit Answer</button>'));
                $('#jspsych-palmer-submitButton').click(function() {
                    save_data();
                });
            }

            // if trial.editable is false, then we are just showing a pre-determined configuration.
            // for now, the only option will be to display for a fixed amount of time.
            // future ideas: allow for key response, to enable things like n-back, same/different, etc..
            if (!trial.editable) {
                showConfiguration(trial.configurations);

                setTimeout(function() {
                    save_data();
                }, trial.timing_item);
            }

            if (trial.prompt !== "") {
                display_element.append($('<div id="jspsych-palmer-prompt">'));
                $("#jspsych-palmer-prompt").html(trial.prompt);
            }

            function arrayDifferences(arr1, arr2) {
                var n_diff = 0;
                for (var i = 0; i < arr1.length; i++) {
                    if (arr1[i] != arr2[i]) {
                        n_diff++;
                    }
                }
                return n_diff;
            }

            // save data
            function save_data() {

                // measure RT
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // check if configuration is correct
                // this is meaningless for trials where the user can't edit
                var n_diff = arrayDifferences(trial.configurations, lineIsVisible);
                var correct = (n_diff === 0);

                block.writeData($.extend({}, {
                    "trial_type": "palmer",
                    "trial_index": block.trial_idx,
                    "configuration": JSON.stringify(lineIsVisible),
                    "target_configuration": JSON.stringify(trial.configurations),
                    "rt": response_time,
                    "correct": correct,
                    "num_wrong": n_diff,
                }, trial.data));

                if (trial.editable && trial.show_feedback) {
                    // hide the button
                    $('#jspsych-palmer-submitButton').hide();
                    $('#jspsych-palmer-prompt').hide();

                    showConfiguration(trial.configurations);
                    var feedback = "";
                    if (correct) {
                        feedback = "Correct!";
                    }
                    else {
                        if (n_diff > 1) {
                            feedback = "You missed " + n_diff + " lines. The correct symbol is shown above.";
                        }
                        else {
                            feedback = "You missed 1 line. The correct symbol is shown above.";
                        }
                    }
                    display_element.append($.parseHTML("<p id='jspsych-palmer-feedback'>" + feedback + "</p>"));

                    setTimeout(function() {
                        next_trial();
                    }, trial.timing_feedback);

                }
                else {
                    next_trial();
                }
            }

            function next_trial() {

                display_element.html('');

                // next trial
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
        
        // method for drawing palmer stimuli.
        // returns the string description of svg element containing the stimulus
        // requires raphaeljs library -> www.raphaeljs.com
        
        plugin.generate_stimulus = function(square_size, grid_spacing, circle_radius, configuration) {

            // create a div to hold the generated svg object
            var stim_div = $('body').append('<div id="jspsych-palmer-temp-stim"></div>');

            var size = grid_spacing * (square_size + 1);

            // create the svg raphael object
            var paper = Raphael("jspsych-palmer-temp-stim", size, size);

            // create the circles at the vertices.
            var circles = [];
            var node_idx = 0;
            for (var i = 1; i <= square_size; i++) {
                for (var j = 1; j <= square_size; j++) {
                    var circle = paper.circle(grid_spacing * j, grid_spacing * i, circle_radius);
                    circle.attr("fill", "#000").attr("stroke-width", "0").attr("stroke", "#000").data("node", node_idx);
                    node_idx++;
                    circles.push(circle);
                }
            }

            // create all possible lines that connect circles
            var horizontal_lines = [];
            var vertical_lines = [];
            var backslash_lines = [];
            var forwardslash_lines = [];

            for (var i = 0; i < square_size; i++) {
                for (var j = 0; j < square_size; j++) {
                    var current_item = (i * square_size) + j;
                    // add horizontal connections
                    if (j < (square_size - 1)) {
                        horizontal_lines.push([current_item, current_item + 1]);
                    }
                    // add vertical connections
                    if (i < (square_size - 1)) {
                        vertical_lines.push([current_item, current_item + square_size]);
                    }
                    // add diagonal backslash connections
                    if (i < (square_size - 1) && j < (square_size - 1)) {
                        backslash_lines.push([current_item, current_item + square_size + 1]);
                    }
                    // add diagonal forwardslash connections
                    if (i < (square_size - 1) && j > 0) {
                        forwardslash_lines.push([current_item, current_item + square_size - 1]);
                    }
                }
            }

            var lines = horizontal_lines.concat(vertical_lines).concat(backslash_lines).concat(forwardslash_lines);

            // actually draw the lines
            var lineIsVisible = [];
            var lineElements = [];

            for (var i = 0; i < lines.length; i++) {
                var line = paper.path("M" + circles[lines[i][0]].attr("cx") + " " + circles[lines[i][0]].attr("cy") + "L" + circles[lines[i][1]].attr("cx") + " " + circles[lines[i][1]].attr("cy")).attr("stroke-width", "8").attr("stroke", "#000");
                line.hide();
                lineElements.push(line);
                lineIsVisible.push(0);
            }

            // define some helper functions to toggle lines on and off

            // this function turns a line on/off based on the index (the_line)
            function toggle_line(the_line) {
                if (the_line > -1) {
                    if (lineIsVisible[the_line] === 0) {
                        lineElements[the_line].show();
                        lineElements[the_line].toBack();
                        lineIsVisible[the_line] = 1;
                    }
                    else {
                        lineElements[the_line].hide();
                        lineElements[the_line].toBack();
                        lineIsVisible[the_line] = 0;
                    }
                }
            }

            // displays the line wherever there
            // is a 1 in the array.
            // showConfiguration(configuration) 
            for (var i = 0; i < configuration.length; i++) {
                if (configuration[i] == 1) {
                    toggle_line(i);
                }
            }


            var svg = $("#jspsych-palmer-temp-stim").html();

            $('#jspsych-palmer-temp-stim').remove();

            return svg;
        };

        return plugin;
    })();
})(jQuery);
