/**
 * jspsych-preload
 * documentation: docs.jspsych.org
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
        trials: {
          type: jsPsych.plugins.parameterType.TIMELINE,
          default: []
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
        message: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          default: null
        },
        show_progress_bar: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: true,
        },
        show_detailed_errors: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false
        },
        max_load_time: {
          type: jsPsych.plugins.parameterType.INT,
          default: null
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {

      // create list of media to preload ////

      var images = [];
      var audio = [];
      var video = [];

      if(trial.auto_preload){
        var auto_preload = jsPsych.pluginAPI.getAutoPreloadList();
        images = images.concat(auto_preload.images);
        audio = audio.concat(auto_preload.audio);
        video = video.concat(auto_preload.video);
      }

      if(trial.trials.length > 0){
        var trial_preloads = jsPsych.pluginAPI.getAutoPreloadList(trial.trials);
        images = images.concat(trial_preloads.images);
        audio = audio.concat(trial_preloads.audio);
        video = video.concat(trial_preloads.video);
      }

      images = images.concat(trial.images);
      audio = audio.concat(trial.audio);
      video = video.concat(trial.video);

      images = jsPsych.utils.unique(jsPsych.utils.flatten(images))
      audio = jsPsych.utils.unique(jsPsych.utils.flatten(audio))
      video = jsPsych.utils.unique(jsPsych.utils.flatten(video))

      // render display of message and progress bar

      var html = '';

      if(trial.message !== null){
        html += trial.message;
      }

      if(trial.show_progress_bar){
        html += `
          <div id='jspsych-loading-progress-bar-container' style='height: 10px; width: 300px; background-color: #ddd; margin: auto;'>
            <div id='jspsych-loading-progress-bar' style='height: 10px; width: 0%; background-color: #777;'></div>
          </div>`;
      }

      display_element.innerHTML = html;

      // do preloading

      if(trial.max_load_time !== null){
        jsPsych.pluginAPI.setTimeout(end_trial, trial.max_load_time);
      } 

      var total_n = images.length + audio.length + video.length;
      var loaded = 0;

      function update_loading_progress_bar(){
        loaded++;
        if(trial.show_progress_bar){
          var percent_loaded = (loaded/total_n)*100;
          var preload_progress_bar = jsPsych.getDisplayElement().querySelector('#jspsych-loading-progress-bar');
          if (preload_progress_bar !== null) {
            preload_progress_bar.style.width = percent_loaded+"%";
          }
        }
      }

      function loading_error(e){
        console.log(e);
      }

      function load_video(cb){
        jsPsych.pluginAPI.preloadVideo(video, cb, update_loading_progress_bar, loading_error);
      }

      function load_audio(cb){
        jsPsych.pluginAPI.preloadAudio(audio, cb, update_loading_progress_bar, loading_error);
      }

      function load_images(cb){
        jsPsych.pluginAPI.preloadImages(images, cb, update_loading_progress_bar, loading_error);
      }

      load_video(function(){
        load_audio(function(){
          load_images(end_trial)
        })
      });

      function end_trial(){
        jsPsych.pluginAPI.clearAllTimeouts();

        var trial_data = {
        };
    
        jsPsych.finishTrial(trial_data);
      }
    };
  
    return plugin;
  })();
  