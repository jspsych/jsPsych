/**
 * jspsych-html-audio-response
 * Matt Jaquiery, Feb 2018 (https://github.com/mjaquiery)
 * Becky Gilbert, Apr 2020 (https://github.com/becky-gilbert)
  * Hannah Small, 2020/07/07 (https://github.com/hesmall)
 * added in browser checking and mic checking using this code: https://experiments.ppls.ed.ac.uk/ -- Hannah Small, 2020/07/07
 * added option to manually end recording on each trial
 *
 * plugin for displaying an html stimulus and getting an audio response
 *
 * documentation: docs.jspsych.org
 *
 **/

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
                default: function(data) {
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
                },
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
            allow_playback: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Allow playback',
                default: true,
                description: 'Whether to allow the participant to play back their '+
                'recording and re-record if unhappy.'
            },
            recording_light: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Recording light',
                default: '<div id="jspsych-html-audio-response-light" '+
                    'style="border: 2px solid darkred; background-color: darkred; '+
                    'width: 50px; height: 50px; border-radius: 50px; margin: 20px auto; '+
                    'display: block;"></div>',
                description: 'HTML to display while recording is in progress.'
            },
            recording_light_off: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Recording light (off state)',
                default: '<div id="jspsych-html-audio-response-light" '+
                'style="border: 2px solid darkred; background-color: inherit; '+
                'width: 50px; height: 50px; border-radius: 50px; margin: 20px auto; '+
                'display: block;"></div>',
                description: 'HTML to display while recording is not in progress.'
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
            margin_vertical: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin vertical',
                default: '0px',
                description: 'The vertical margin of the button.'
            },
            margin_horizontal: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '8px',
                description: 'The horizontal margin of the button.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: false,
                description: 'If true, then trial will end when user responds.'
            },
            wait_for_mic_approval: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Wait for mic approval',
                default: false,
                description: 'If true, the trial will not start until the participant approves the browser mic request.'
            },
            enable_mic_message: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Will allow pop-up for participant to enable microphone',
                default: false,
                description: 'If true, will allow the browser mic request. This should be done before recording any audio!'
            },
            manually_end_recording: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Subject will manually end their recording',
                default: false,
                description: 'If true, the subject will have to press a key to stop recording and continue.'
            },
            manually_end_recording_key: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name: 'Key to manually end recording',
                default: jsPsych.ALL_KEYS,
                description: 'The key to end recording on any given trial, default is any key.'

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

        // add recording off light
        html += '<div id="jspsych-html-audio-response-recording-container">'+trial.recording_light_off+'</div>';

        // add audio element container with hidden audio element
        html += '<div id="jspsych-html-audio-response-audio-container"><audio id="jspsych-html-audio-response-audio" controls style="visibility:hidden;"></audio></div>';

        // add button element with hidden buttons
        html += '<div id="jspsych-html-audio-response-buttons"><button id="jspsych-html-audio-response-rerecord" class="jspsych-audio-response-button jspsych-btn" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'; visibility:hidden;">Retry</button><button id="jspsych-html-audio-response-okay" class="jspsych-audio-response-button jspsych-btn" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'; visibility:hidden;">Sounds good!</button></div>';

        function start_trial() {
            display_element.innerHTML = html;
            document.querySelector('#jspsych-html-audio-response-okay').addEventListener('click', end_trial);
            document.querySelector('#jspsych-html-audio-response-rerecord').addEventListener('click', start_recording);
            // Add visual indicators to let people know we're recording
            document.querySelector('#jspsych-html-audio-response-recording-container').innerHTML = trial.recording_light;
            // trial start time
            start_time = performance.now();
            // set timer to hide-html if stimulus duration is set
            if (trial.stimulus_duration !== null) {
                jsPsych.pluginAPI.setTimeout(function() {
                    display_element.querySelector('#jspsych-html-audio-response-stimulus').style.visibility = 'hidden';
                }, trial.stimulus_duration);
            }
            if (!trial.wait_for_mic_approval) {
                start_recording();
            }
        }

        // audio element processing
        function start_recording() {
            // hide existing playback elements
            playbackElements.forEach(function (id) {
                let element = document.getElementById(id);
                element.style.visibility = 'hidden';
            });
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(process_audio);
            if (!trial.wait_for_mic_approval) {
                // Add visual indicators to let people know we're recording
                document.querySelector('#jspsych-html-audio-response-recording-container').innerHTML = trial.recording_light;
            }
        }
        
        // function to handle responses by the subject
        function process_audio(stream) {

            if (trial.wait_for_mic_approval) {
                if (start_time === null) {
                    start_trial();
                } else {
                    document.querySelector('#jspsych-html-audio-response-recording-container').innerHTML = trial.recording_light;
                }
            } 

            // This code largely thanks to skyllo at
            // http://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/

            // store streaming data chunks in array
            const chunks = [];
            // create media recorder instance to initialize recording
            // Note: the MediaRecorder function is not supported in Safari or Edge

            //ADD check for browser! FROM https://experiments.ppls.ed.ac.uk/, THANKS TO ANNIE HOLTZ AND KENNY SMITH

            var wrong_browser_message = "Sorry, it's not possible to run the experiment on your web browser. Please try using Chrome or Firefox instead.";
            var declined_audio_message = "You must allow audio recording to take part in the experiment. Please reload the page and allow access to your microphone to proceed.";

            // function that throws error and displays message if experiment is run in browsers that do not support MediaRecorder, or if microphone access is denied
            function errorQuit(message) {
              var body = document.getElementsByTagName('body')[0];
              body.innerHTML = '<p style="color: #FF0000">'+message+'</p>'+body.innerHTML;//defines the style of error messages
              throw error;
            };

            //either starts handlerFunction if access to microphone is enabeled or catches that it is blocked and calls errorQuit function
            if(trial.enable_mic_message){
                navigator.mediaDevices.getUserMedia({audio:true})
                    .then(stream => {handlerFunction(stream)})
                    .catch(error => {errorQuit(declined_audio_message)});
            }else{
                recorder = new MediaRecorder(stream)
                stream = recorder.stream
                handlerFunction(stream)
            }
            //function that catches incompatibility with MediaRecorder (e.g. in Safari or Edge)
            function handlerFunction(stream) {
                try {
                    recorder = new MediaRecorder(stream);
                    recorder.data = [];
                    recorder.wrapUp = false;
                    recorder.ondataavailable = function(e) {
                    // add stream data to chunks
                    chunks.push(e.data);
                    if (recorder.wrapUp) {
                        if (typeof trial.postprocessing !== 'undefined') {
                            trial.postprocessing(chunks)
                                .then(function(processedData) {
                                    onRecordingFinish(processedData);
                                });
                    } else {
                        // should never fire - trial.postprocessing should use the default function if
                        // not passed in via trial parameters
                        onRecordingFinish(chunks);
                    }
                    }
                }; 

                // start recording with 1 second time between receiving 'ondataavailable' events
                recorder.start(1000);
                
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
            } catch(error) {
                errorQuit(wrong_browser_message);
            };
        }
                   
           // navigator.mediaDevices.getUserMedia({audio:true});
            //recorder = new MediaRecorder(stream);
            //recorder.data = [];
            //recorder.wrapUp = false;

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


        function showPlaybackTools(data) {
            // Audio Player
            let playerDiv = display_element.querySelector('#jspsych-html-audio-response-audio-container');
            let url;
            if (data instanceof Blob) {
                const blob = new Blob(data, { type: 'audio/webm' });
                url = (URL.createObjectURL(blob));
            } else {
                url = data;
            }
            let player = playerDiv.querySelector('#jspsych-html-audio-response-audio');
            player.src = url;
            player.style.visibility = "visible";
            // Okay/rerecord buttons
            let buttonDiv = document.querySelector('#jspsych-html-audio-response-buttons');
            let rerecord = buttonDiv.querySelector('#jspsych-html-audio-response-rerecord');
            let okay = buttonDiv.querySelector('#jspsych-html-audio-response-okay');
            rerecord.style.visibility = 'visible';
            okay.style.visibility = 'visible';
            // Save ids of things we want to hide later:
            playbackElements = [player.id, okay.id, rerecord.id];
        }

        function onRecordingFinish(data) {
            // switch to the off visual indicator
            let light = document.querySelector('#jspsych-html-audio-response-recording-container');
            if (light !== null)
                light.innerHTML = trial.recording_light_off;
            // measure rt
            let end_time = performance.now();
            let rt = end_time - start_time;
            response.audio_data = data.str;
            response.audio_url = data.url;
            response.rt = rt;

            if (trial.response_ends_trial) {
                end_trial();
            } else if (trial.allow_playback) {  // only allow playback if response doesn't end trial
                showPlaybackTools(response.audio_url);
            } else { 
                // fallback in case response_ends_trial and allow_playback are both false, 
                // which would mean the trial never ends
                end_trial();
            }
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
                "key_press": response.key
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        }

        if (trial.wait_for_mic_approval) {
            start_recording();
            } else {
                start_trial();
            }

    };

    return plugin;
})();