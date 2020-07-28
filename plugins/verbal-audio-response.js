/**
 * jspsych-html-audio-response
 * Matt Jaquiery, Feb 2018 (https://github.com/mjaquiery)
 * Becky Gilbert, Apr 2020 (https://github.com/becky-gilbert)
* Hannah Small, 2020/07/07 (https://github.com/hesmall)
 * added in browser checking and mic checking using this code: https://experiments.ppls.ed.ac.uk/ -- Hannah Small, 2020/07/07
 * added option to manually end recording on each trial
 *
 * Connor Keane, July 2020 (https://github.com/kxnr or https://github.com/kahana-sysadmin)
 * refactored recording code to use persistent recorder in jspsych instance
 * 
 * plugin for displaying an html stimulus and getting an audio response
 *
 *
 **/

let defaultPostprocess = function(data) {
    return new Promise(function(resolve) {
        const blob = new Blob(data, { type: 'audio/webm' });
        // create URL, which is used to replay the audio file (if allow_playback is true)
        let url = URL.createObjectURL(blob);
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);
        const readerPromise = new Promise(function(resolveReader) {
            reader.onloadend = function() {
                // Create base64 string, which is used to save the audio data in JSON/CSV format.
                // This has to go inside of a Promise so that the base64 data is converted before the 
                // higher-level data processing Promise is resolved (since that will pass the base64
                // data to the onRecordingFinish function).
                var base64 = reader.result;
                base64 = base64.split(',')[1];
                resolveReader(base64);
            };
        });
        readerPromise.then(function(base64) {
            // After the base64 string has been created we can resolve the higher-level Promise, 
            // which pass both the base64 data and the URL to the onRecordingFinish function.
            var processed_data = {url: url, str: base64};
            resolve(processed_data);
        });
    });
}

jsPsych.plugins["html-audio-response"] = (function() {

    var plugin = {};

    plugin.info = {
        name: 'html-audio-response',
        description: 'Present a string and retrieve an audio response.',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The string to be displayed'
            },
            buffer_length: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Buffer length',
                default: 4000,
                description: 'Length of the audio buffer.'
            },
            postprocessing: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Postprocessing function',
                default: defaultPostprocess,
                description: 'Function to execute on the audio data prior to saving. '+
                    'This function takes the audio data as an argument, '+
                    'and returns an object with keys called "str" and "url". '+
                    'The str and url values are saved in the trial data as "audio_data" and "audio_url". '+
                    'The url value is used as the audio source to replay the recording if allow_playback is true. '+
                    'By default, the str value is a base64 string which can be saved in the JSON/CSV data and '+
                    'later converted back into an audio file. '+
                    'This parameter can be used to pass a custom function that saves the file using a different '+
                    'method/format and generates an ID that relates this file to the trial data. '+
                    'The custom postprocessing function must return an object with "str" and "url" keys. '+
                    'The url value must be a valid audio source, which is used if allow_playback is true. '+
                    'The str value can be null.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed under the button.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to show the stimulus.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: false,
                description: 'If true, then trial will end when user responds.'
            },
            manually_end_recording_key: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name: 'Key to manually end recording',
                default: jsPsych.NO_KEYS,
                description: 'The key to end recording on any given trial, default is no keys.'

            }
        }
    };

    plugin.trial = function(display_element, trial) {

        if(typeof trial.stimulus === 'undefined'){
            console.error('Required parameter "stimulus" missing in html-audio-response');
        }

        let playbackElements = [];
        // store response
        let response = {
            rt: null,
            audio_data: null
        };
        let recorder = null;
        let start_time = null;

        // add stimulus
        let html = '<div id="jspsych-html-audio-response-stimulus">'+trial.stimulus+'</div>';

        // add prompt if there is one
        if (trial.prompt !== null) {
            html += trial.prompt;
        }

        function start_trial() {
            display_element.innerHTML = html;
            // trial start time
            start_time = performance.now();

            // set timer to hide-html if stimulus duration is set
            if (trial.stimulus_duration !== null) {
                jsPsych.pluginAPI.setTimeout(function() {
                    display_element.querySelector('#jspsych-html-audio-response-stimulus').style.visibility = 'hidden';
                }, trial.stimulus_duration);
            }

            start_recording();
        }

        // audio element processing
        function start_recording() {
            recorder = jsPsych.pluginAPI.getRecordingBuffer();
            recorder.data = [];
            let chunks = [];
            recorder.ondataavailable = function(e) {
                    // add stream data to chunks
                    chunks.push(e.data);}
            recorder.onstop = function(e) {
                trial.postprocessing(chunks)
                     .then(function(processedData) {
                        onRecordingFinish(processedData);
                     }
            }

            recorder.start(1000);
        }
        
        var after_response = function(info){

            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-html-audio-response-stimulus').className += ' responded';

            // only record the first response
            if (response.key == null) {
                response = info;
            }

            // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
            recorder.stop();
            recorder.wrapUp = true;
        }

        function onRecordingFinish(data) {
            //
            // measure rt
            let end_time = performance.now();
            let rt = end_time - start_time;
            response.audio_data = data.str;
            response.audio_url = data.url;
            response.rt = rt;

            end_trial();
        }

        // function to end trial when it is time
        function end_trial() {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            //kill keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();

            // gather the data to store for the trial
            let trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "audio_data": response.audio_data,
                "key_press": response.key,
                "start_time": start_time,
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        }


        if(trial.manually_end_recording == false){
            // setTimeout to stop recording after 4 seconds
            setTimeout(function() {
                // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
                recorder.stop();
                recorder.wrapUp = true;
                }, trial.buffer_length);
        }else{
            //wait for response from keyboard to end recording
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.manually_end_recording_key,
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
            });
        }

        start_trial();
    };

    return plugin;
})();
