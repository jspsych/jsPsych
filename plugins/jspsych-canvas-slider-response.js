/**
 * jspsych-canvas-slider-response
 * Chris Jungerius (modified from Josh de Leeuw)
 *
 * a jsPsych plugin for displaying a canvas stimulus and getting a slider response
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['canvas-slider-response'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'canvas-slider-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The drawing function to apply to the canvas. Should take the canvas object as argument.'
            },
            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: 0,
                description: 'Sets the minimum value of the slider.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: 100,
                description: 'Sets the maximum value of the slider',
            },
            slider_start: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: 50,
                description: 'Sets the starting value of the slider',
            },
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: 1,
                description: 'Sets the step of the slider'
            },
            labels: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Labels',
                default: [],
                array: true,
                description: 'Labels of the slider.',
            },
            slider_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider width',
                default: null,
                description: 'Width of the slider in pixels.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Continue',
                array: false,
                description: 'Label of the button to advance.'
            },
            require_movement: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Require movement',
                default: false,
                description: 'If true, the participant will have to move the slider before continuing.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the slider.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
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
            canvas_size: {
                type: jsPsych.plugins.parameterType.INT,
                array: true,
                pretty_name: 'Canvas size',
                default: [500, 500],
                description: 'Array containing the height (first value) and width (second value) of the canvas element.'
            }

        }
    }

    plugin.trial = function (display_element, trial) {

        var html = '<div id="jspsych-canvas-slider-response-wrapper" style="margin: 100px 0px;">';
        html += '<div id="jspsych-canvas-slider-response-stimulus">' + '<canvas id="jspsych-canvas-stimulus" height="' + trial.canvas_size[0] + '" width="' + trial.canvas_size[1] + '"></canvas>' + '</div>';
        html += '<div class="jspsych-canvas-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
        if (trial.slider_width !== null) {
            html += trial.slider_width + 'px;';
        } else {
            html += trial.canvas_size[1] + 'px;';
        }
        html += '">';
        html += '<input type="range" value="' + trial.slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" style="width: 100%;" id="jspsych-canvas-slider-response-response"></input>';
        html += '<div>'
        for (var j = 0; j < trial.labels.length; j++) {
            var width = 100 / (trial.labels.length - 1);
            var left_offset = (j * (100 / (trial.labels.length - 1))) - (width / 2);
            html += '<div style="display: inline-block; position: absolute; left:' + left_offset + '%; text-align: center; width: ' + width + '%;">';
            html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + '</span>';
            html += '</div>'
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';

        if (trial.prompt !== null) {
            html += trial.prompt;
        }

        // add submit button
        html += '<button id="jspsych-canvas-slider-response-next" class="jspsych-btn" ' + (trial.require_movement ? "disabled" : "") + '>' + trial.button_label + '</button>';

        display_element.innerHTML = html;

        // draw
        let c = document.getElementById("jspsych-canvas-stimulus")
        trial.stimulus(c)

        var response = {
            rt: null,
            response: null
        };

        if (trial.require_movement) {
            display_element.querySelector('#jspsych-canvas-slider-response-response').addEventListener('click', function () {
                display_element.querySelector('#jspsych-canvas-slider-response-next').disabled = false;
            })
        }

        display_element.querySelector('#jspsych-canvas-slider-response-next').addEventListener('click', function () {
            // measure response time
            var endTime = performance.now();
            response.rt = endTime - startTime;
            response.response = display_element.querySelector('#jspsych-canvas-slider-response-response').valueAsNumber;

            if (trial.response_ends_trial) {
                end_trial();
            } else {
                display_element.querySelector('#jspsych-canvas-slider-response-next').disabled = true;
            }

        });

        function end_trial() {

            jsPsych.pluginAPI.clearAllTimeouts();

            // save data
            var trialdata = {
                rt: response.rt,
                response: response.response,
                slider_start: trial.slider_start
            };

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        }

        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                display_element.querySelector('#jspsych-canvas-slider-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }

        var startTime = performance.now();
    };

    return plugin;
})();
