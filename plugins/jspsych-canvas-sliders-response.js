/**
 * jspsych-canvas-sliders-response
 * a jspsych plugin for free response to questions presented using canvas
 * drawing tools. This version uses two sliders to record responses. Both
 * slider values will be included in the final data, but it is possible to
 * specify that changing one slider should reset the other to default. This,
 * combined with requiring one of the sliders to be moved prior to accepting
 * the response, allows simulation of a forced choice between two scaled
 * options.
 *
 * the canvas drawing is done by a function which is supplied as the stimulus.
 * this function is passed the id of the canvas on which it will draw.
 *
 * the canvas can either be supplied as customised HTML, or a default one
 * can be used. If a customised on is supplied, its ID must be specified
 * in a separate variable.
 *
 * Matt Jaquiery - https://github.com/mjaquiery/ - Feb 2018
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['canvas-sliders-response'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'canvas-sliders-response',
    description: 'Collect multiple slider responses to stimuli '+
        'drawn on an HTML canvas',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The function to be called with the canvas ID. '+
          'This should handle drawing operations.'
      },
      canvasHTML: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Canvas HTML',
        default: null,
        description: 'HTML for drawing the canvas. '+
          'Overrides canvas width and height settings.'
      },
      canvasId: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Canvas ID',
        default: false,
        description: 'ID for the canvas. Only necessary when '+
          'supplying canvasHTML. This is required so that the ID '+
          'can be passed to the stimulus function.'
      },
      canvasWidth: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas width',
        default: 300,
        description: 'Sets the width of the canvas.'
      },
      canvasHeight: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas height',
        default: 150,
        description: 'Sets the height of the canvas.'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: [0],
        array: true,
        description: 'Sets the minimum value of the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: [100],
        array: true,
        description: 'Sets the maximum value of the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value.'
      },
      start: {
		type: jsPsych.plugins.parameterType.INT,
		pretty_name: 'Slider starting value',
		default: [50],
        array: true,
		description: 'Sets the starting value of the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value.'
			},
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: [1],
        array: true,
        description: 'Sets the step of the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value.'
      },
      labels: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        pretty_name:'Labels',
        default: [[]],
        array: true,
        description: 'Labels of the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value. '+
            'Each array entry must be an array of strings for the labels '+
            'which apply to that slider.'
      },
      one_slider_only: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Single slider response only',
          default: false,
          description: 'Whether changing one slider resets the other sliders '+
            'to their starting values.'
      },
      require_change: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Require change',
          default: false,
          array: true,
          description: 'Whether one of these sliders must have been changed '+
            'before a response is accepted. Format is an array of ints, where '+
            'non-zero ints specify slider sets. At least one slider in each '+
            'set must be changed before the response is accepted.'
      },
      require_change_warning: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Require change warning',
          default: ['<span style="color: red; font-size: 80px">'+
            'At least one of the bars must have been moved to continue.'
            +'</span>'],
          array: true,
          description: 'HTML to display when not enough sliders have been '+
            'moved to continue',
      },
      slider_arrangement: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Slider arrangment',
          default: null,
          array: true,
          description: 'Sliders with the same slider arrangement value '+
            'will be placed on the same row, with those appearing first '+
            'placed to the left of those appearing later'.
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        array: true,
        description: 'Any content here will be displayed below the sliders. '+
            'Format is an array of length sliderCount. '+
            'Shorter arrays will be padded with the final value.'
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
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    let canvas = '';
    // Use the supplied HTML for constructing the canvas, if supplied
    if(trial.canvasId !== false) {
      canvas = trial.canvasHTML;
    } else {
      // Otherwise create a new default canvas
      trial.canvasId = '#jspsych-canvas-slider-response-canvas';
      canvas = '<canvas id="'+trial.canvasId+'" height="'+trial.canvasHeight+
        '" width="'+trial.canvasWidth+'"></canvas>';
    }
    var html = '<div id="jspsych-canvas-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-canvas-slider-response-stimulus">'+canvas+'</div>';
    html += '<div class="jspsych-canvas-slider-response-container" style="position:relative;">';
    html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-canvas-slider-response-response"></input>';
    html += '<div>'
    for(var j=0; j < trial.labels.length; j++){
      var width = 100/(trial.labels.length-1);
      var left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
      html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add submit button
    html += '<button id="jspsych-canvas-slider-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    // Execute the supplied drawing function
    trial.stimulus(trial.canvasId);

    var response = {
      rt: null,
      response: null
    };

    display_element.querySelector('#jspsych-canvas-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-canvas-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-canvas-slider-response-next').disabled = true;
      }

    });

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-canvas-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
