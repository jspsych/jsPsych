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
          default: false,
          description: 'Whether or not to automatically preload any media files based on the timeline passed to jsPsych.init.'
        },
        trials: {
          type: jsPsych.plugins.parameterType.TIMELINE,
          default: [],
          description: 'Array with a timeline of trials to automatically preload. If one or more trial objects is provided, '+
          'then the plugin will attempt to preload the media files used in the trial(s).'
        },
        images: {
          type: jsPsych.plugins.parameterType.STRING,
          default: [],
          description: 'Array with one or more image files to load. This parameter is often used in cases where media files cannot '+
          'be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with '+
          'timeline variables or dynamic parameters, or because the image is embedded in an HTML string.'
        },
        audio: {
          type: jsPsych.plugins.parameterType.STRING,
          default: [],
          description: 'Array with one or more audio files to load. This parameter is often used in cases where media files cannot '+
          'be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with '+
          'timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.'
        },
        video: {
          type: jsPsych.plugins.parameterType.STRING,
          default: [],
          description: 'Array with one or more video files to load. This parameter is often used in cases where media files cannot '+
          'be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with '+
          'timeline variables or dynamic parameters, or because the video is embedded in an HTML string.'
        },
        message: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          default: null,
          description: 'HTML-formatted message to be shown above the progress bar while the files are loading.'
        },
        show_progress_bar: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: true,
          description: 'Whether or not to show the loading progress bar.'
        },
        continue_after_error: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false,
          description: 'Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs, '+
          'the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end '+
          'and preloading failure will be logged in the trial data.'
        },
        error_message: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          default: 'The experiment failed to load.',
          description: 'Error message to show on the page in case of any loading errors. This parameter is only relevant when continue_after_error is false.'
        },
        show_detailed_errors: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false,
          description: 'Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the '+
          'page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.'
        },
        max_load_time: {
          type: jsPsych.plugins.parameterType.INT,
          default: null,
          description: 'The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial '+
          '(if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false). '+
          'If null, the plugin will wait indefintely for the files to load.'
        },
        on_error: {
          type: jsPsych.plugins.parameterType.FUNCTION,
          default: null,
          description: 'Function to be called after a file fails to load. The function takes the file name as its only argument.'
        },
        on_success: {
          type: jsPsych.plugins.parameterType.FUNCTION,
          default: null,
          description: 'Function to be called after a file loads successfully. The function takes the file name as its only argument.'
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {

      var success = null;
      var timeout = false;
      var failed_images = [];
      var failed_audio = [];
      var failed_video = [];
      var detailed_errors = [];
      var in_safe_mode = jsPsych.getSafeModeStatus();

      // create list of media to preload //

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

      images = jsPsych.utils.unique(jsPsych.utils.flatten(images));
      audio = jsPsych.utils.unique(jsPsych.utils.flatten(audio));
      video = jsPsych.utils.unique(jsPsych.utils.flatten(video));

      if (in_safe_mode) {
        // don't preload video if in safe mode (experiment is running via file protocol)
        video = [];
      }

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
        jsPsych.pluginAPI.setTimeout(on_timeout, trial.max_load_time);
      } 

      var total_n = images.length + audio.length + video.length;
      var loaded = 0;  // success or error count
      var loaded_success = 0; // success count

      if (total_n == 0) {
        on_success();
      } else {
        function load_video(cb){
          jsPsych.pluginAPI.preloadVideo(video, cb, file_loading_success, file_loading_error);
        }
        function load_audio(cb){
          jsPsych.pluginAPI.preloadAudio(audio, cb, file_loading_success, file_loading_error);
        }
        function load_images(cb){
          jsPsych.pluginAPI.preloadImages(images, cb, file_loading_success, file_loading_error);
        }
        if (video.length > 0) { load_video(function () { }) }
        if (audio.length > 0) { load_audio(function () { }) }
        if (images.length > 0) { load_images(function () { }) }
      }

      // helper functions and callbacks

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

      // called when a single file loading fails
      function file_loading_error(e) {
        // update progress bar even if there's an error
        update_loading_progress_bar();
        // change success flag after first file loading error
        if (success == null) {
          success = false;
        }
        // add file to failed media list
        var source = "unknown file";
        if (e.source) {
          source = e.source;
        }
        if (e.error && e.error.path && e.error.path.length > 0) {
          if (e.error.path[0].localName == "img") {
            failed_images.push(source);
          } else if (e.error.path[0].localName == "audio") {
            failed_audio.push(source);
          } else if (e.error.path[0].localName == "video") {
            failed_video.push(source);
          }
        }
        // construct detailed error message
        var err_msg = '<p><strong>Error loading file: '+source+'</strong><br>';
        if (e.error.statusText) {
          err_msg += 'File request response status: '+e.error.statusText+'<br>';
        }
        if (e.error == "404") {
          err_msg += '404 - file not found.<br>';
        }
        if (typeof e.error.loaded !== 'undefined' && e.error.loaded !== null && e.error.loaded !== 0) {
          err_msg += e.error.loaded+' bytes transferred.';
        } else {
          err_msg += 'File did not begin loading. Check that file path is correct and reachable by the browser,<br>'+
          'and that loading is not blocked by cross-origin resource sharing (CORS) errors.';
        }
        err_msg += '</p>';
        detailed_errors.push(err_msg);
        // call trial's on_error function
        after_error(source);
        // if this is the last file
        if (loaded == total_n) {
          if (trial.continue_after_error) {
            // if continue_after_error is false, then stop with an error
            end_trial();
          } else {
            // otherwise end the trial and continue
            stop_with_error_message();
          }
        }
      }

      // called when a single file loads successfully
      function file_loading_success(source) {
        update_loading_progress_bar();
        // call trial's on_success function
        after_success(source);
        loaded_success++;
        if (loaded_success == total_n) {
          // if this is the last file and all loaded successfully, call success function
          on_success();
        } else if (loaded == total_n) {
          // if this is the last file and there was at least one error
          if (trial.continue_after_error) {
            // end the trial and continue with experiment
            end_trial();
          } else {
            // if continue_after_error is false, then stop with an error
            stop_with_error_message();
          }
        }
      }

      // called if all files load successfully
      function on_success() {
        if (typeof timeout !== 'undefined' && timeout === false) {
          // clear timeout immediately after finishing, to handle race condition with max_load_time
          jsPsych.pluginAPI.clearAllTimeouts();
          // need to call cancel preload function to clear global jsPsych preload_request list, even when they've all succeeded
          jsPsych.pluginAPI.cancelPreloads();
          success = true;
          end_trial();
        }
      }

      // called if all_files haven't finished loading when max_load_time is reached
      function on_timeout() {
        //console.log('timeout fired');
        jsPsych.pluginAPI.cancelPreloads();
        if (typeof success !== 'undefined' && (success === false || success === null)) {
          timeout = true;
          if (loaded_success < total_n) {
            success = false;
          }
          after_error('timeout'); // call trial's on_error event handler here, in case loading timed out with no file errors
          detailed_errors.push('<p><strong>Loading timed out.</strong><br>'+
              'Consider compressing your stimuli files, loading your files in smaller batches,<br>'+
              'and/or increasing the <i>max_load_time</i> parameter.</p>');
          if (trial.continue_after_error) {
            end_trial();
          } else {
            stop_with_error_message();
          }
        }
      }

      function stop_with_error_message() {
        jsPsych.pluginAPI.clearAllTimeouts();
        jsPsych.pluginAPI.cancelPreloads();
        // show error message
        display_element.innerHTML = trial.error_message;
        // show detailed errors, if necessary
        if (trial.show_detailed_errors) {
          display_element.innerHTML += '<p><strong>Error details:</strong></p>';
          detailed_errors.forEach(function(e) {
            display_element.innerHTML += e;
          });
        }
      }

      function after_error(source) {
        // call on_error function and pass file name
        if (trial.on_error !== null) {
          trial.on_error(source);
        }
      }
      function after_success(source) {
        // call on_success function and pass file name
        if (trial.on_success !== null) {
          trial.on_success(source);
        }
      }

      function end_trial(){
        // clear timeout again when end_trial is called, to handle race condition with max_load_time
        jsPsych.pluginAPI.clearAllTimeouts();
        var trial_data = {
          success: success,
          timeout: timeout,
          failed_images: failed_images,
          failed_audio: failed_audio,
          failed_video: failed_video
        };
        // clear the display
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      }
    };
  
    return plugin;
  })();
  