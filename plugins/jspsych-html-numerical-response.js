/**
 * jsPsych plugin for validating numerical responses.
 * @name jspsych-html-numerical-response
 * @author Daan Beverdam
 **/

jsPsych.plugins['html-numerical-response'] = (function () {
    var plugin = {};

    plugin.info = {
        name: 'html-numerical-response',
        description: 'A plugin for displaying a stimulus and validating numerical responses.',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'HTML string to be displayed.'
            },
            correct_response: {
                type: jsPsych.plugins.parameterType.NUMBER,
                pretty_name: 'Correct response',
                default: undefined,
                description: 'The correct numerical response.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Submit',
                description: 'Text that is shown on the submit button.'
            },
            show_feedback: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Show feedback',
                default: true,
                description: 'Whether to show the user if the response is correct or false.'
            },
            feedback_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Feedback duration',
                default: 0,
                description: 'How long to show the feedback to the user (in ms) before advancing to the next trial.'
            },
            correct_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Correct label',
                default: 'Correct!',
                description: 'What to show to the user on a correct response.'
            },
            incorrect_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Incorrect label',
                default: 'Wrong!',
                description: 'What to show to the user on a incorrect response.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {
        display_element.innerHTML = '';
        var form = document.createElement('form');
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            evaluate_answer();
        }, false);

        var problem = document.createElement('div');
        problem.innerHTML = trial.stimulus;

        var button = document.createElement('button');
        button.innerHTML = trial.button_label;
        button.type = 'submit';

        var input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';

        form.appendChild(problem);
        form.appendChild(input);
        form.appendChild(button);
        display_element.appendChild(form);

        var start_time = performance.now();

        function evaluate_answer() {
            var end_time = performance.now();
            var rt = end_time - start_time;

            var given_response = parseFloat(input.value);
            var correct = given_response == trial.correct_response;

            if (trial.show_feedback) {
                if (trial.feedback_duration <= 0) {
                    trial.feedback_duration = 2000;
                }
                show_feedback(correct);
            }

            var trial_data = {
                rt: rt,
                correct_response: trial.correct_response,
                given_response: given_response,
                correct: correct
            };

            jsPsych.pluginAPI.setTimeout(function () {
                display_element.innerHTML = '';
                jsPsych.finishTrial(trial_data);
            }, trial.feedback_duration);
        }

        function show_feedback(correct) {
            if (correct) {
                display_element.innerHTML = trial.correct_label;
            } else {
                display_element.innerHTML = trial.incorrect_label;
            }
        }
    };

    return plugin;
})();
