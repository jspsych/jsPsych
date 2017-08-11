/**
 * kaj-audio-keyboard-response
 * Khia Johnson
 *
 * Modified version of "jspsych-audio-keyboard-response" by Josh de Leeuw
 *
 * This plugin plays an audio file, gets a keyboard response, and provides feedback. 
 *
 * documentation for "jspsych-audio-keyboard-response" at docs.jspsych.org
 * new parameters include correct_key, provide_feedback, feedback_duration, and feedback_text
 *
 **/

jsPsych.plugins["single-audio-keyboard-response"] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('single-audio-keyboard-response', 'stimulus', 'audio');

    plugin.info = {
        name: 'single-audio-keyboard-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The audio to be played.'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name: 'Choices',
                array: true,
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: '',
                description: 'Any content here will be displayed below the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: -1,
                description: 'The maximum duration to wait for a response.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, the trial will end when user makes a response.'
            },
            trial_ends_after_audio: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Trial ends after audio',
                default: false,
                description: 'If true, then the trial will end as soon as the audio file finishes playing.'
            },
            correct_key: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Correct key',
                default: undefined,
                description: 'Integer indicating the correct key - use js keystrokes'
            },
            provide_feedback: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Trial feedback',
                default: false,
                description: 'If true, feedback will be displayed to the participant for 1000 ms'
            },
            feedback_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Feedback duration',
                default: 500,
                description: 'The length of time to display feedback for, defaults to 500 ms'
            },
            feedback_text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Feedback text',
                default: ["<h1 style='color:lightseagreen'>&check;</h1>", "<h1 style='color:orangered'>&cross;</h1>"],
                array: true,
                description: 'Array of feedback in the form ["Correct", Incorrect"].'
            },
        }
    }

    plugin.trial = function (display_element, trial) {

        // setup stimulus
        var context = jsPsych.pluginAPI.audioContext();
        if (context !== null) {
            var source = context.createBufferSource();
            source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            source.connect(context.destination);
        } else {
            var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            audio.currentTime = 0;
        }

        // set up end event if trial needs it

        if (trial.trial_ends_after_audio) {
            if (context !== null) {
                source.onended = function () {
                    end_trial();
                }
            } else {
                audio.addEventListener('ended', end_trial);
            }
        }


        // store response
        var response = {
            rt: -1,
            key: -1
        };

        // function to end trial when it is time
        function end_trial() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // stop the audio file if it is playing
            // remove end event listeners if they exist
            if (context !== null) {
                source.stop();
                source.onended = function () {
                }
            } else {
                audio.pause();
                audio.removeEventListener('ended', end_trial);
            }

            // kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();

            // gather the data to store for the trial
            var trial_data = {
                "rt": context !== null ? response.rt * 1000 : response.rt,
                "rt_performance": response_detected - end_audio,
                "stimulus": trial.stimulus,
                "key_press": response.key
            };


            // display feedback
            if (trial.provide_feedback === true) {
                if (response.key === trial.correct_key) {
                    display_element.innerHTML = trial.feedback_text[0]
                }
                else {
                    display_element.innerHTML = trial.feedback_text[1]
                }

                // move onto next trial after set time
                setTimeout(function () {
                    jsPsych.finishTrial(trial_data)
                }, Number(trial.feedback_duration));

            } else {
                jsPsych.finishTrial(trial_data)
            }
        };

        // function to handle responses by the subject
        var after_response = function (info) {

            // only record the first response
            if (response.key == -1) {
                response = info;
                response_detected = performance.now(); //record time at which response is detected

            }

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        // show prompt if there is one
        if (trial.prompt !== "") {
            display_element.innerHTML = trial.prompt;
        }

        // start the response listener
        function start_response_listener() {
            if (context !== null) {
                //end_audio = performance.now(); // record time at which audio ends
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: 'audio',
                    persist: false,
                    allow_held_key: false,
                    audio_context: context,
                    audio_context_start_time: startTime
                });
            }
            else {
                //end_audio = performance.now(); // record time at which audio ends
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: 'date',
                    persist: false,
                    allow_held_key: false
                });
            }

        };

        // start audio
        // if(context !== null){
        startTime = context.currentTime + 0.1;
        source.start(startTime);
        source.onended = function () {
            source.stop();
            end_audio = performance.now();
            start_response_listener();
        };


        // end trial if time limit is set
        if (trial.trial_duration > 0) {
            jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();