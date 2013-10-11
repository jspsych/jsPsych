/* utility package for jsPsych */

(function($) {

    jsPsych.utils = (function() {

        // public methods
        var public_object = {};

        // take the hierarchically arranged jsPsych.data object and turn it into
        // a one-dimensional array where each entry is data from a  single trial
        // append_data is optional and can be items that should be added to all
        // trials, such as a subject identifier
        public_object.flatten_data_object = function(data_object, append_data) {

            append_data = (typeof append_data === undefined) ? {} : append_data;

            var trials = [];

            // loop through data_object
            for (var i = 0; i < data_object.length; i++) {
                for (var j = 0; j < data_object[i].length; j++) {
                    var data = $.extend({}, data_object[i][j], append_data);
                    trials.push(data);
                }
            }

            return trials;
        }

        // method for drawing palmer stimuli.
        // returns the string description of svg element containing the stimulus
        // requires raphaeljs library -> www.raphaeljs.com
        public_object.draw_palmer_stimulus = function(square_size, grid_spacing, circle_radius, configuration) {

            // create a div to hold the generated svg object
            var stim_div = $('body').append('<div id="stim_palmer"></div>');

            var size = grid_spacing * (square_size + 1);

            // create the svg raphael object
            var paper = Raphael("stim_palmer", size, size);

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


            var svg = $("#stim_palmer").html();

            $('#stim_palmer').remove();

            return svg;
        };

        public_object.palmer_add_random_connected_element = function(square_size, configuration) {
            // make sure that configuration is not ALL 1's
            if ($.inArray(0, configuration) == -1) {
                return configuration;
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

            function build_possible_lines_list() {
                // get a list of all the lines that exist in the passed configuration
                var possible_lines_to_connect_from = [];
                $.each(configuration, function(i, v) {
                    if (v == 1) {
                        possible_lines_to_connect_from.push(i);
                    }
                });

                // randomly select one of the lines
                var choice = possible_lines_to_connect_from[Math.floor(Math.random() * possible_lines_to_connect_from.length)];

                // randomly select which end of the line to connect to
                var circles = lines[choice];

                // build a list of all possible lines that contain the circles
                var possible_new_lines = [];
                for(var i=0;i<circles.length;i++){
                    $.each(lines, function(index, v) {
                        if ($.inArray(circles[i], v) > -1) {
                            if (configuration[index] === 0) { // this excludes lines that already exist
                                possible_new_lines.push(index);
                            }
                        }
                    });
                }

                return possible_new_lines;
            }

            var possible_new_lines = build_possible_lines_list();

            // make sure there are lines to add
            /*while (possible_new_lines.length === 0) {
                possible_new_lines = build_possible_lines_list();
            }*/

            // now pick a random line to add
            var random_new_line = possible_new_lines[Math.floor(Math.random() * possible_new_lines.length)];

            var output = configuration.slice(0);
            output[random_new_line] = 1;
            
            return output;
        };

        return public_object;
    })();

})(jQuery);