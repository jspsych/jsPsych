import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "audio-keyboard-response",
  parameters: {
    /* The audio to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /* The keys the subject is allowed to press to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      array: true,
      default: "ALL_KEYS",
    },
    /* Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /* The maximum duration to wait for a response. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /* If true, the trial will end when user makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /* If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },
    /* If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

class AudioKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // setup stimulus
    var context = this.jsPsych.pluginAPI.audioContext();
    var audio;

    // store response
    var response = {
      rt: null,
      key: null,
    };

    // record webaudio context start time
    var startTime;

    // load audio file
    this.jsPsych.pluginAPI
      .getAudioBuffer(trial.stimulus)
      .then(function (buffer) {
        if (context !== null) {
          audio = context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(context.destination);
        } else {
          audio = buffer;
          audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch(function (err) {
        console.error(
          `Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`
        );
        console.error(err);
      });

    function setupTrial() {
      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {
        audio.addEventListener("ended", end_trial);
      }

      // show prompt if there is one
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }

      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        audio.start(startTime);
      } else {
        audio.play();
      }

      // start keyboard listener when trial starts or sound ends
      if (trial.response_allowed_while_playing) {
        setup_keyboard_listener();
      } else if (!trial.trial_ends_after_audio) {
        audio.addEventListener("ended", setup_keyboard_listener);
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(function () {
          end_trial();
        }, trial.trial_duration);
      }
    }

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        audio.stop();
      } else {
        audio.pause();
      }

      audio.removeEventListener("ended", end_trial);
      audio.removeEventListener("ended", setup_keyboard_listener);

      // kill keyboard listeners
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    }

    // function to handle responses by the subject
    function after_response(info) {
      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    function setup_keyboard_listener() {
      // start the response listener
      if (context !== null) {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "audio",
          persist: false,
          allow_held_key: false,
          audio_context: context,
          audio_context_start_time: startTime,
        });
      } else {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      }
    }
  }
}

export default AudioKeyboardResponsePlugin;
