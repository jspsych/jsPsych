/**
 * jsPsych plugin for posing math problems.
 * @name jspsych-math-problems
 * @author Daan Beverdam
 **/

jsPsych.plugins['math-problems'] = (function () {
    var plugin = {};

    plugin.info = {
        name: 'math-problems',
        description: 'A plugin for posing math problems.',
        parameters: {
            problem: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Problem',
                default: undefined,
                description: 'Human readable math problem to solve.'
            },
            solution: {
                type: jsPsych.plugins.parameterType.NUMBER,
                pretty_name: 'Solution',
                default: undefined,
                description: 'Numerical solution to the math problem. Can also be an expression.'
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
                description: 'Whether to show the user if the answer is correct or false.'
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
                description: 'What to show to the user on a correct answer.'
            },
            incorrect_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Incorrect label',
                default: 'Wrong!',
                description: 'What to show to the user on a incorrect answer.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {
        var form = document.createElement('form');
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            evaluate_answer();
        }, false);

        var problem = document.createElement('div');
        problem.innerHTML = trial.problem;

        var button = document.createElement('button');
        button.innerHTML = trial.button_label;
        button.type = 'submit';

        var input = document.createElement('input');
        input.type = 'number';

        form.appendChild(problem);
        form.appendChild(input);
        form.appendChild(button);
        display_element.appendChild(form);

        var start_time = performance.now();

        function evaluate_answer() {
            var end_time = performance.now();
            var rt = end_time - start_time;

            var given_solution = parseFloat(input.value);
            var correct = given_solution == trial.solution;

            if (trial.show_feedback) {
                if (trial.feedback_duration <= 0) {
                    trial.feedback_duration = 2000;
                }
                show_feedback(correct);
            }

            var trial_data = {
                rt: rt,
                correct_solution: trial.solution,
                given_solution: given_solution,
                correct: correct
            };

            jsPsych.pluginAPI.setTimeout(function () {
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