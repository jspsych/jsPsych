/**
 * jspsych-html-button-response-circle
 * Eline Van Geert
 *
 * based on jspsych-html-button-response by Josh de Leeuw
 * and jspsych-visual-search-circle by Josh de Leeuw
 *
 * plugin for displaying a set of response buttons in a circle (equidistant from fixation)
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["html-button-response-circle"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "html-button-response-circle",
    parameters: {
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn" style="padding:10px 10px"><img src="%choice%" width="100"></button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      button_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Button size',
        array: true,
        default: [120,120],
        description: 'Two element array indicating the height and width of the response buttons. Do not forget to take any padding into account in the height and width calculation. In the case of images, define the button size as the addition of padding and image size as defined in button_html.'
      },
      prompt_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt HTML',
        default: "",
        description: 'Any content here will be displayed above the button circle.'
      },
      prompt_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Prompt duration',
        default: null,
        description: 'How long to show the prompt.'
      },
      fixation_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Fixation HTML',
        default: "",
        description: 'Any content in this fixation division will be displayed in the center of the button circle.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [50, 50],
        description: 'Two element array indicating the height and width of the fixation division. Do not forget to take any padding into account in the height and width calculation. In the case of images, no need to define fixation_size.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: null,
        description: 'How long to show the fixation division.'
      },
      circle_diameter: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle diameter',
        default: 500,
        description: 'The diameter of the button circle in pixels.'
      },
      circle_offset: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle offset',
        default: Math.floor(Math.random() * 360),
        description: 'The circle offset determines where on the circle the buttons will be located.'
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
        description: 'If true, then trial will end when user responds.'
      }
    }
  }
  plugin.trial = function(display_element, trial) {
      
    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.button_size[0];

    // stimuli width, height
    var stimh = trial.button_size[0];
    var stimw = trial.button_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;
      
    // fixation width, height
    var fixh = trial.fixation_size[0];
    var fixw = trial.fixation_size[1];    
    var hfixh = fixh / 2;
    var hfixw = fixw / 2;

    // fixation location
    var fix_loc = [(paper_size/2) - hfixw, (paper_size/2) - hfixh]

    // possible button locations on the circle
    var display_locs = [];
    var possible_display_locs = trial.choices.length;
    var circle_offset = trial.circle_offset;
    for (var i = 0; i < possible_display_locs; i++) {
      display_locs.push([
        Math.floor(paper_size / 2 + (cosd(circle_offset + (i * (360 / possible_display_locs))) * radi) - hstimw), 
        Math.floor(paper_size / 2 - (sind(circle_offset + (i * (360 / possible_display_locs))) * radi) - hstimh)
      ]);
    }
      
    // show prompt if there is one
    if (trial.prompt_html !== null) {
        display_element.innerHTML += '<div id="jspsych-html-button-response-circle-prompt">'+trial.prompt_html+'</div>';
    }

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-button-response-circle plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
      
      display_element.innerHTML += '<div id="jspsych-html-button-response-circle-btngroup" style="width:' + paper_size + 'px; height:' + paper_size + 'px; display:block; margin-left: auto; margin-right: auto; position:relative;"></div>';
    var paper = display_element.querySelector("#jspsych-html-button-response-circle-btngroup");
  
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      paper.innerHTML += '<div class="jspsych-html-button-response-circle-button" style="display: inline-block;  position:absolute; top:' + display_locs[i][0] + 'px; left:' + display_locs[i][1] + 'px; width: ' + trial.button_size[0] + 'px; height:'+ trial.button_size[1] +'px; " id="jspsych-html-button-response-circle-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
      
    // show fixation division if there is one
    if (trial.fixation_html !== null) {
        paper.innerHTML  += "<div class='jspsych-html-button-response-circle-fixation' style='position: absolute; top:"+fix_loc[0]+"px; left:"+fix_loc[1]+"px; width:"+trial.fixation_size[0]+"px; height:"+trial.fixation_size[1]+"px; display:flex;justify-content:center;align-items:center;'>" + trial.fixation_html+"  </div>";
    }
      
    paper.innerHTML += '</div>';
    
    // start time
    var start_time = performance.now();

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      display_element.querySelector('#jspsych-html-button-response-circle-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
      });
    }

    // store response
    var response = {
      rt: null,
      button: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the prompt will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-button-response-circle-prompt').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-html-button-response-circle-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {


      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "button_pressed": response.button
//        "choice": trial.choices[response.button]
//        "choices": trial.choices,
//        "prompt": trial.prompt_html,
//        "fixation": trial.fixation_html,
      };

      // clear the display
      display_element.innerHTML = '';
       
      // move on to the next trial
      jsPsych.finishTrial(trial_data);
        
    };

    // hide prompt if timing is set
    if (trial.prompt_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-button-response-circle-prompt').style.visibility = 'hidden';
      }, trial.prompt_duration);
    }
      
    // hide fixation division if timing is set
    if (trial.fixation_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-button-response-circle-fixation').style.visibility = 'hidden';
      }, trial.fixation_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };
    
  // helper function for determining button locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }
    
  return plugin;
})();
