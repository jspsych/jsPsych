/**
 * jspsych-canvas-keyboard-response
 * adapted from Matt Jaquiery "jspsych-canvas-sliders-response" and "jspsych-html-keyboard-response"
 *
 * Sandy Tanwisuth, GitHub@sandguine, May 2020
 *
 */


jsPsych.plugins['canvas-keyboard-response'] = (function() {

    let plugin = {};

    plugin.info = {
        name: 'canvas-keyboard-response',
        description: 'Collect keyboard responses to stimuli '+
        'drawn on an HTML canvas',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The function to be called with the canvas ID. '+
                'This should handle drawing operations.'
            },
            canvasHTML: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Canvas HTML',
                default: null,
                description: 'HTML for drawing the canvas. '+
                'Overrides canvas width and height settings.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Content to display below the stimulus.'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
              },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when user makes a response.'
            },
        }
    };

    plugin.trial = function(display_element, trial) {
        let canvas = '';
        // Use the supplied HTML for constructing the canvas, if supplied
        if(trial.canvasId !== false) {
            canvas = trial.canvasHTML;
        } else {
            // Otherwise create a new default canvas
            trial.canvasId = 'jspsych-canvas-keyboard-response-canvas';
            canvas = '<canvas id="'+trial.canvasId+'" height="'+trial.canvasHeight+
                '" width="'+trial.canvasWidth+'"></canvas>';
        }
        let html = '<div id="jspsych-canvas-keyboard-response-wrapper" class="jspsych-keyboard-response-wrapper">';
        html += '<div id="jspsych-canvas-keyboard-response-stimulus">'+canvas+'</div>';


        // Prompt text
        if (trial.prompt !== null) {
            html += '<div id="jspsych-keyboard-response-prompt">'+trial.prompt+'</div>';
        }

        // basic styling
        html += '<style type="text/css">table.jspsych-keyboard-table {width: 100%}'+
            'div.jspsych-keyboard-row {display: inline-flex; width: 100%}'+
            'div.jspsych-keyboard-col {width: 100%}</style>';

        display_element.innerHTML += html;

        let response = {
            startTime: performance.now(),
            rt: null,
            response: null,
            stimulus_properties: null
        };

        // Execute the supplied drawing function
        response.stimulus_properties = trial.stimulus(trial.canvasId);

        function end_trial(){

            // save data
            let trialdata = {
                "startTime": response.startTime,
                "rt": response.rt,
                "response": response.response,
                "stimulus_properties": response.stimulus_properties
            };

            jsPsych.pluginAPI.clearAllTimeouts();

            if(trial.stimulus_duration !== null)
                trialdata.stimulusOffTime = response.stimulusOffTime;

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        }

        // function to handle responses by the subject
        var after_response = function(info) {

        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspsych-canvas-keyboard-response-stimulus').className += ' responded';

        // only record the first response
        if (response.key == null) {
        response = info;
        }

        if (trial.response_ends_trial) {
        end_trial();
        }
        };

        // start the response listener
        if (trial.choices != jsPsych.NO_KEYS) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
        });
        }


        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }
    };

    return plugin;
})();
