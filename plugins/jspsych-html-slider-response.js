/**
 * jspsych-html-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['html-slider-response'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'html-slider-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The HTML string to be displayed'
            },
            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: 0,
                description: 'Sets the minimum value of the slider. If more then one slider should be shown, specify this as an array.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: 100,
                description: 'Sets the maximum value of the slider. If more then one slider should be shown, specify this as an array.',
            },
            slider_start: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: 50,
                description: 'Sets the starting value of the slider. If more then one slider should be shown, specify this as an array.',
            },
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: 1,
                description: 'Sets the step of the slider. If more then one slider should be shown, specify this as an array.'
            },
            labels: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Labels',
                default: [],
                array: true,
                description: 'Labels of the slider. If more then one slider should be shown, specify this as an array.',
            },
            slider_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider width',
                default: null,
                description: 'Width of the slider in pixels. If more then one slider should be shown, specify this as an array.'
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
                description: 'If true, the participant will have to move the slider before continuing. If more then one slider should be shown, specify this as an array.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the slider. If more then one slider should be shown, specify this as an array.'
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
        }
    }

    plugin.trial = function (display_element, trial) {

        // half of the thumb width value from jspsych.css, used to adjust the label positions
        var half_thumb_width = 7.5;

        var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
        html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + '</div>';



        // check if multiple sliders

        let n_min = getLength(trial.min);
        let n_max = getLength(trial.max);
        let n_sliderStart = getLength(trial.slider_start);
        let n_step = getLength(trial.n_step);
        let n_labels = getLengthOfLabels(trial.labels);
        let n_sliderWidth = getLength(trial.slider_width);
        let n_requireMovement = getLength(trial.require_movement);
        let n_prompt = getLength(trial.prompt);

        let n_sliders = getMax([n_min, n_max, n_sliderStart, n_step, n_labels, n_sliderWidth, n_requireMovement, n_prompt]);

        let hasMovedArr = [true];
        if (trial.require_movement === true) {
            hasMovedArr = [false];
        } else if (Array.isArray(trial.require_movement)) {
            hasMovedArr = [!trial.require_movement[0]];
            for (let i = 1; i < trial.require_movement.length; i++) {
                hasMovedArr.push(!trial.require_movement[i]);
            }
        }



        for (let i = 0; i < n_sliders; i++) {
            let sliderStart = getElementFromArrayOrNot(trial.slider_start, i);
            let min = getElementFromArrayOrNot(trial.min, i);
            let max = getElementFromArrayOrNot(trial.max, i);
            let step = getElementFromArrayOrNot(trial.step, i);
            let labels = getElementFromArrayOrNotLabels(trial.labels, i);
            let prompt = getElementFromArrayOrNot(trial.prompt, i);
            let sliderWidth = getElementFromArrayOrNot(trial.slider_width, i);

            html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
            if (trial.slider_width !== null) {
                html += 'width:' + sliderWidth + 'px;';
            } else {
                html += 'width:auto;';
            }
            html += '">';

            html += '<input type="range" class="jspsych-slider" value="' + sliderStart + '" min="' + min + '" max="' + max + '" step="' + step + '" id="jspsych-html-slider-response-response-' + i.toString() + '"></input>';
            for (var j = 0; j < labels.length; j++) {
                var label_width_perc = 100 / (labels.length - 1);
                var percent_of_range = j * (100 / (labels.length - 1));
                var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
                var offset = (percent_dist_from_center * half_thumb_width) / 100;
                html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
                    'left:calc(' + percent_of_range + '% - (' + label_width_perc + '% / 2) - ' + offset + 'px); text-align: center; width: ' + label_width_perc + '%;">';
                html += '<span style="text-align: center; font-size: 80%;">' + labels[j] + '</span>';
                html += '</div>'
            }
            html += '</div>';




            if (prompt !== null) {
                html += prompt;
            }
            html += '</div>';
        }
        html += '</div>';



        let hasMoved = true;
        for (let i = 0; i < hasMovedArr.length; i++) {
            hasMoved = hasMoved && hasMovedArr[i];
        }


        // add submit button
        html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" ' + (!hasMoved ? "disabled" : "") + '>' + trial.button_label + '</button>';

        display_element.innerHTML = html;

        var response = {
            rt: null,
            response: null
        };

        for (let i = 0; i < n_sliders; i++) {
            let requireMovement = getElementFromArrayOrNot(trial.require_movement,i);
            if (requireMovement) {
                display_element.querySelector('#jspsych-html-slider-response-response-' + i.toString()).addEventListener('click', function () {
                    hasMovedArr[i] = true;
                    let hasMovedNow = true;
                    for (let j = 0; j < hasMovedArr.length; j++) {
                        hasMovedNow = hasMovedNow && hasMovedArr[j];
                    }
                    console.log(hasMovedArr);
                    if (hasMovedNow) {
                        display_element.querySelector('#jspsych-html-slider-response-next').disabled = false;
                    }
                });
            }
        }

        display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function () {
            // measure response time
            var endTime = performance.now();
            response.rt = endTime - startTime;

            if (n_sliders === 1) {
                response.response = display_element.querySelector('#jspsych-html-slider-response-response-0').valueAsNumber;
            } else {
                response.response = [];
                for (let i = 0; i < n_sliders; i++) {
                    response.response.push(display_element.querySelector('#jspsych-html-slider-response-response-' + i.toString()).valueAsNumber);
                }
            }

            if (trial.response_ends_trial) {
                end_trial();
            } else {
                display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
            }

        });

        function end_trial() {

            jsPsych.pluginAPI.clearAllTimeouts();

            // save data
            var trialdata = {
                rt: response.rt,
                stimulus: trial.stimulus,
                slider_start: trial.slider_start,
                response: response.response
            };

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        }

        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
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


function getLength(obj) {
    if (obj === null || !Array.isArray(obj)) {
        return 1;
    }
    return obj.length;
}

function getLengthOfLabels(labels) {
    if (labels === [] || !Array.isArray(labels[0])) {
        return 1;
    }
    return labels.length;
}

function getElementFromArrayOrNotLabels(labels, i) {
    if (labels === [] || !Array.isArray((labels[0]))) {
        return labels;
    }
    return labels[i]
}

function getMax(arr) {
    let m = arr[0];
    for (let i = 1; i < arr.length; i++) {
        m = arr[i] > m ? arr[i] : m;
    }
    return m;
}

function getElementFromArrayOrNot(obj, i) {
    if (obj === null) return null;
    if (!Array.isArray(obj)) return obj;
    return obj[i];
}