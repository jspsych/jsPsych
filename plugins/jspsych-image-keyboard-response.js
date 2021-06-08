/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["image-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-keyboard-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      render_on_canvas: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Render on canvas',
        default: true,
        description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).'+
          'If false, the image will be shown via an img element.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var height, width;
    if (trial.render_on_canvas) {
      var image_drawn = false;
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      // create canvas element and image
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-image-keyboard-response-stimulus";
      canvas.style.margin = 0;
      canvas.style.padding = 0;
      var ctx = canvas.getContext("2d");
      var img = new Image();   
      img.onload = function() {
        // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
        if (!image_drawn) {
          getHeightWidth(); // only possible to get width/height after image loads
          ctx.drawImage(img,0,0,width,height);
        }
      };
      img.src = trial.stimulus;
      // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
      function getHeightWidth() {
        if (trial.stimulus_height !== null) {
          height = trial.stimulus_height;
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (trial.stimulus_width !== null) {
          width = trial.stimulus_width;
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
          }
        } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
          // if stimulus width is null, only use the image's natural width if the width value wasn't set 
          // in the if statement above, based on a specified height and maintain_aspect_ratio = true
          width = img.naturalWidth;
        }
        canvas.height = height;
        canvas.width = width;
      }
      getHeightWidth(); // call now, in case image loads immediately (is cached)
      // add canvas and draw image
      display_element.insertBefore(canvas, null);
      if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
        // if image has loaded and width/height have been set, then draw it now
        // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
        ctx.drawImage(img,0,0,width,height);
        image_drawn = true;  
      }
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML('beforeend', trial.prompt);
      }

    } else {

      // display stimulus as an image element
      var html = '<img src="'+trial.stimulus+'" id="jspsych-image-keyboard-response-stimulus">';
      // add prompt
      if (trial.prompt !== null){
        html += trial.prompt;
      }
      // update the page content
      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      var img = display_element.querySelector('#jspsych-image-keyboard-response-stimulus');
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
        }
      } else {
        height = img.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set 
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = img.naturalWidth;
      }
      img.style.height = height.toString() + "px";
      img.style.width = width.toString() + "px";
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-image-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
    }
  };

  return plugin;
})();
