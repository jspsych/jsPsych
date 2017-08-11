/**
 * kaj-mult-audio-keyboard-response
 * Khia Johnson
 *
 * Based on "jspsych-audio-keyboard-response" by Josh de Leeuw
 *
 * This plugin plays 3 audio files sequentially, gets a keyboard response, and optionally provides feedback. 
 * Suitable for a 3-oddity interval paradigm (similar to AXB) for audio. 
 *
 * documentation for "jspsych-audio-keyboard-response" at docs.jspsych.org 
 * documentation for new parameters in progress
 *
 *
 **/

jsPsych.plugins["mult-audio-keyboard-response"] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('mult-audio-keyboard-response', 'stimuli', 'audio');

    // parmeters for plugin
    plugin.info = {
        name: 'mult-audio-keyboard-response',
        description: '',
        parameters: {
            stimuli: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Stimuli',
                array: true,
                default: undefined,
                description: 'The audio to be played. Array must be of length 3.'
            },
            correct: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'correct filename',
                default: '',
                description: 'File path to indicating the correct answer, to match file path in stimuli'
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
                description: 'Any content here will be displayed on the screen.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: -1,
                description: 'The maximum duration to wait for a response after all audio played.'
            },
            isi: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'ISI',
                default: 500,
                description: 'Th inter-stimulus interval (in ms)- default 500 ms.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, the trial will end when user makes a response after the third audio.'
            },
            provide_feedback: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Trial feedback',
                default: false,
                description: 'If true, feedback will be displayed to the participant. If false , participants will see a response detected message'
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
                default: ["<h1 style='color:lightseagreen'>&check;</h1>","<h1 style='color:orangered'>&cross;</h1>", "<h2 style='color:gray'>response detected</h2>"],
                array: true,
                description: 'Array of feedback in the form ["correct", incorrect","response detected].'
            },
        }
    };

    // fisher-yates shuffle
    function shuffle(array) {
        var i = 0, j = 0, temp = null;
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp
        }
    }

    plugin.trial = function (display_element, trial) {

        //shuffle order of stimuli presentation
        shuffle(trial.stimuli);

        // setup audio stimulus 1
        var context1 = jsPsych.pluginAPI.audioContext();
        if (context1 !== null) {
            var source1 = context1.createBufferSource();
            source1.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[0]);
            source1.connect(context1.destination);
        } else {
            var audio1 = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[0]);
            audio1.currentTime = 0;
        }

        // setup audio stimulus 2
        var context2 = jsPsych.pluginAPI.audioContext();
        if (context2 !== null) {
            var source2 = context2.createBufferSource();
            source2.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[1]);
            source2.connect(context2.destination);
        } else {
            var audio2 = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[1]);
            audio2.currentTime = 0;
        }

        // setup audio stimulus 3
        var context3 = jsPsych.pluginAPI.audioContext();
        if (context3 !== null) {
            var source3 = context3.createBufferSource();
            source3.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[2]);
            source3.connect(context3.destination);
        } else {
            var audio3 = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[2]);
            audio3.currentTime = 0;
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

            // stop the audio file if it is playing & remove end event listeners if they exist
            if (context3 !== null) {
                source3.stop();
                source3.onended = function () {
                    console.log(source3.currentTime)
                }
            } else {
                audio3.pause();
                audio3.removeEventListener('ended', end_trial);
            }

            // kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();

            // gather the data to store for the trial
            var trial_data = {
                "rt": context3 !== null ? response.rt * 1000 : response.rt,
                "rt_performance": response_detected - end_audio,
                "startTime": startTime,
                "stimulus": JSON.stringify([trial.stimuli[0], trial.stimuli[1], trial.stimuli[2]]),
                "key_press": response.key,
                "correct_text": trial.correct,
                "selected": trial.stimuli[response.key - 49]
            };

            // display feedback
            if (trial.provide_feedback === true) {
                if (trial_data.selected===trial_data.correct_text) {
                    display_element.innerHTML = trial.feedback_text[0]
                }
                else {
                    display_element.innerHTML = trial.feedback_text[1]
                }

                // move onto next trial after set time
                setTimeout(function () {jsPsych.finishTrial(trial_data)}, Number(trial.feedback_duration));

            } else {
                display_element.innerHTML = trial.feedback_text[2];

                setTimeout(function () {jsPsych.finishTrial(trial_data)}, Number(trial.feedback_duration));

                //jsPsych.finishTrial(trial_data)
            }

        };

        // function to handle responses by the subject
        var after_response = function (info) {

            // only record the first response
            if (response.key === -1) {
                response = info;
                response_detected = performance.now(); //record time at which response is detected
            }

            // end trial
            if (trial.response_ends_trial) {
                end_trial();
            }
        };


        // function to start the response listener --  called in source3.onended
        function start_response_listener() {
            if (context3 !== null) {
                end_audio = performance.now(); // record time at which response listener starts
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: 'audio',
                    persist: false,
                    allow_held_key: false,
                    audio_context: context1,
                    audio_context_start_time: startTime
                });
            } else {
                end_audio = performance.now(); // record time at which response listener starts
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: 'date',
                    persist: false,
                    allow_held_key: false
                });
            }
        }

        // clear display at beginning of trial
        display_element.innerHTML = "";

        //play audio and display prompt
        var startTime = context1.currentTime;
        jsPsych.pluginAPI.setTimeout(function () {
            source1.start()
        }, trial.isi);
        source1.onended = function () {
            source1.stop();
            jsPsych.pluginAPI.setTimeout(function () {
                source2.start()
            }, trial.isi);
        };
        source2.onended = function () {
            source2.stop();
            jsPsych.pluginAPI.setTimeout(function () {
                source3.start()
            }, trial.isi);
        };
        source3.onended = function () {
            source3.stop();
            end_audio = performance.now(); // record time at which audio ends
            start_response_listener();
            jsPsych.pluginAPI.setTimeout(function () {
                display_element.innerHTML = trial.prompt
            }, 0);

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
