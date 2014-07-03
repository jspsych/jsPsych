/**
 * jspsych-visual-search-circle
 * Josh de Leeuw
 * 
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 * 
 * based on code written for psychtoolbox by Ben Motz
 * 
 * todo: 
 * check for performance.now support
 * generalize set sizes
 * 
 **/

(function($) {
    jsPsych["visual-search-circle"] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(params.target_present.length);

            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "visual-search-circle";
                trials[i].target_present = params.target_present[i];
                trials[i].set_size = params.set_size[i];
                trials[i].target = params.target;
                trials[i].foil = params.foil;
                trials[i].fixation_image = params.fixation_image;
                trials[i].target_size = params.target_size || [50, 50];
                trials[i].fixation_size = params.fixation_size || [16, 16];
                trials[i].target_present_key = params.target_present_key || 74;
                trials[i].target_absent_key = params.target_absent_key || 70;
                trials[i].timing_max_search = (typeof params.timing_max_search === 'undefined') ? -1 : params.timing_max_search;
                trials[i].timing_fixation = (typeof params.timing_fixation === 'undefined') ? 1000 : params.timing_fixation;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }

            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            trial = jsPsych.normalizeTrialVariables(trial);

            // screen information
            var screenw = $(window).width();
            var screenh = $(window).height();
            var centerx = screenw / 2;
            var centery = screenh / 2;

            // params
            var diam = 250; // pixels
            var radi = diam / 2;
            var paper_size = diam + trial.target_size[0];

            // Determine locations based on width/height of stimuli
            var stimh = trial.target_size[0];
            var stimw = trial.target_size[1];
            var hstimh = stimh / 2;
            var hstimw = stimw / 2;

            // [left, top, right, bottom]

            var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0]), Math.floor(paper_size / 2 - trial.fixation_size[1])];

            var display_locs = [
                [Math.floor(paper_size / 2 + (cosd(60) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(60) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(30) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(30) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(0) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(0) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(330) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(330) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(300) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(300) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(270) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(270) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(240) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(240) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(210) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(210) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(180) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(180) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(150) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(150) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(120) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(120) * radi) - hstimh)],
                [Math.floor(paper_size / 2 + (cosd(90) * radi) - hstimw), Math.floor(paper_size / 2 - (sind(90) * radi) - hstimh)]
            ];

            var stim_locs = stimLocs(trial.set_size, trial.target_present);

            // get target to draw on
            var paper = Raphael(centerx - diam / 2, centery - diam / 2, paper_size, paper_size);

            show_fixation();

            function show_fixation() {
                // show fixation
                var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);

                // wait 
                setTimeout(function() {
                    fixation.remove();
                    show_search_array();
                }, trial.timing_fixation);
            }

            // scope these variables higher
            var correct;
            var rt;
            var key_press;

            function show_search_array() {

                var search_array_images = [];

                for (var i = 0; i < stim_locs.length; i++) {
                    if (stim_locs[i] !== 0) {
                        var which_image = (stim_locs[i] == 1) ? trial.target : trial.foil;

                        var img = paper.image(which_image, display_locs[i][0], display_locs[i][1], trial.target_size[0], trial.target_size[1]);

                        search_array_images.push(img);
                    }
                }

                var trial_over = false;

                var resp_function = function(e) {
                    if (e.which == trial.target_present_key || e.which == trial.target_absent_key) {
                        rt = performance.now() - start_time;

                        trial_over = true;

                        key_press = e.which;

                        correct = 0;
                        if (e.which == trial.target_present_key && trial.target_present || 
                            e.which == trial.target_absent_key && !trial.target_present) {
                            correct = 1;
                        }

                        $(document).unbind('keydown', resp_function);

                        clear_display();

                        end_trial();
                    }
                };

                $(document).keydown(resp_function);

                var start_time = performance.now();

                if (trial.timing_max_search > 0) {
                    setTimeout(function() {

                        if (!trial_over) {
                            rt = performance.now() - start_time;

                            trial_over = true;

                            correct = 0;
                            key_press = -1;

                            $(document).unbind('keydown', resp_function);

                            clear_display();

                            end_trial();
                        }
                    }, trial.timing_max_search);
                }

                function clear_display() {
                    for (var i = 0; i < search_array_images.length; i++) {
                        search_array_images[i].remove();
                    }
                }
            }


            function end_trial() {

                // data saving
                var trial_data = {
                    trial_type: trial.type,
                    trial_index: block.trial_idx,
                    correct: correct,
                    rt: rt,
                    key_press: key_press,
                    locations: JSON.stringify(stim_locs),
                    target_present: trial.target_present,
                    set_size: trial.set_size
                };

                // this line merges together the trial_data object and the generic
                // data object (trial.data), and then stores them.
                block.writeData($.extend({}, trial_data, trial.data));

                // this method must be called at the end of the trial
                block.next();
            }
        };

        // helper function for determining stimulus locations
        function stimLocs(set_size, target_present) {

            var locs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // fixed length of 12 (for now)
            var start_loc = Math.floor(Math.random() * 12);

            if (target_present) {
                locs[start_loc] = 1; // show target
            }
            else {
                locs[start_loc] = -1; // show foil
            }

            var c_loc = (start_loc + 12 / set_size) % 12;
            for (var i = 1; i < set_size; i++) {
                locs[c_loc] = -1; // show foil
                c_loc = (c_loc + 12 / set_size) % 12;
            }

            return locs;
        }


        // cos, sin functions
        function cosd(num) {
            return Math.cos(num / 180 * Math.PI);
        }

        function sind(num) {
            return Math.sin(num / 180 * Math.PI);
        }

        return plugin;
    })();
})(jQuery);
