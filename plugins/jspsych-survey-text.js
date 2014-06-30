/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-survey-text
 *
 */

(function($) {
    jsPsych['survey-text'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['data']);
            
            var trials = [];
            for (var i = 0; i < params.questions.length; i++) {
                trials.push({
                    type: "survey-text",
                    questions: params.questions[i],
                    data: (typeof params.data === 'undefined') ? {} : params.data[i]
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

            // add likert scale questions
            for (var i = 0; i < trial.questions.length; i++) {
                // create div
                display_element.append($('<div>', {
                    "id": 'jspsych-survey-text-' + i,
                    "class": 'jspsych-survey-text-question'
                }));

                // add question text
                $("#jspsych-survey-text-" + i).append('<p class="jspsych-survey-text">' + trial.questions[i] + '</p>');

                // add text box
                $("#jspsych-survey-text-" + i).append('<input type="text" name="#jspsych-survey-text-response-' + i + '"></input>');
            }

            // add submit button
            display_element.append($('<button>', {
                'id': 'jspsych-survey-text-next',
                'class': 'jspsych-survey-text'
            }));
            $("#jspsych-survey-text-next").html('Submit Answers');
            $("#jspsych-survey-text-next").click(function() {
                // measure response time
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // create object to hold responses
                var question_data = {};
                $("div.jspsych-survey-text-question").each(function(index) {
                    var id = "Q" + index;
                    var val = $(this).children('input').val();
                    var obje = {};
                    obje[id] = val;
                    $.extend(question_data, obje);
                });

                // save data
                block.writeData($.extend({}, {
                    "trial_type": "survey-text",
                    "trial_index": block.trial_idx,
                    "rt": response_time
                }, question_data, trial.data));

                display_element.html('');

                // next trial
                block.next();
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);
