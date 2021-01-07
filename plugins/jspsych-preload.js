/**
 * jspsych-preload
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins['preload'] = (function() {

    var plugin = {};
  
    plugin.info = {
      name: 'preload',
      description: '',
      parameters: {
        auto_preload: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false
        },
        images: {
          type: jsPsych.plugins.parameterType.STRING,
          default: []
        },
        audio: {
          type: jsPsych.plugins.parameterType.STRING,
          default: []
        },
        video: {
          type: jsPsych.plugins.parameterType.STRING,
          default: []
        },
        show_progress_bar: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: true,
        },
        show_detailed_errors: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false
        },
      }
    }
  
    plugin.trial = function(display_element, trial) {

      if(trial.auto_preload){
        var {images, audio, video} = jsPsych.getAutoPreloadList() //timeline arg?
      }
      
      
      function end_trial(){
        var trial_data = {
          value: return_val
        };
    
        jsPsych.finishTrial(trial_data);
      }
    };
  
    return plugin;
  })();
  