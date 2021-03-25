/**
 * jspsych-survey-slider
 * a jspsych plugin for free response survey questions
 *
 * Bobby McHardy
 * March 25th, 2021
 *
 */

jsPsych.plugins['survey-slider'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-slider',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          stimulus: {
            type: jsPsych.plugins.parameterType.HTML_STRING,
            pretty_name: 'Stimulus',
            default: undefined,
            description: 'The HTML string to be displayed'
          },
          min: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Min slider',
            default: 0,
            description: 'Sets the minimum value of the slider.'
          },
          max: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Max slider',
            default: 100,
            description: 'Sets the maximum value of the slider',
          },
          slider_start: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Slider starting value',
            default: 50,
            description: 'Sets the starting value of the slider',
          },
          step: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Step',
            default: 1,
            description: 'Sets the step of the slider'
          },
          prompt: {
            type: jsPsych.plugins.parameterType.HTML_STRING,
            pretty_name: 'Prompt',
            default: null,
            description: 'Any content here will be displayed below the slider.'
          },
          labels: {
            type: jsPsych.plugins.parameterType.HTML_STRING,
            pretty_name:'Labels',
            default: [],
            array: true,
            description: 'Labels of the slider.',
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Makes answering the question required.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: false,
        description: 'If true, the order of the questions will be randomized'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'String to display at top of the page.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move all sliders before continuing.'
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Scale width',
        default: null,
        description: 'Width of the likert scales in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      },
      autocomplete: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow autocomplete',
        default: false,
        description: "Setting this to true will enable browser auto-complete or auto-fill for the form."
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if(trial.scale_width !== null) {
      var w = trial.scale_width + 'px';
    } else {
      var w = '100%';
    }

    var html = "";

    // show preamble text
    if(trial.preamble !== null) {
      html += '<div id="jspsych-survey-slider-preamble" class="jspsych-survey-slider-preamble">'+trial.preamble+'</div>';
    }

    if ( trial.autocomplete ) {
      html += '<form id="jspsych-survey-slider-form">';
    } else {
      html += '<form id="jspsych-survey-slider-form" autocomplete="off">';
    }

    // add slider scale questions with question order spec
    var question_order = [];
    var question_ismovement = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
      question_ismovement.push(false);
    }
    if (trial.randomize_question_order) {
      question_order = jsPsych.randomization.shuffle(question_order);
    }
    
    var half_thumb_width = 7.5; 
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];

      html += '<div id="jspsych-survey-slider-response-stimulus">' + question.stimulus + '</div>';

      html += '<div class="jspsych-survey-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
      if (trial.slider_width !== null) {
        html += 'width:'+trial.slider_width+'px;';
      } else {
        html += 'width:auto;';
      }
      html += '">';
      html += '<input type="range" name="Q' + question_order[i] + '" data-name="'+ question.name +'" class="jspsych-slider" value="'+question.slider_start+'" min="'+question.min+'" max="'+question.max+'" step="'+question.step+'" id="jspsych-survey-slider-response-response"></input>';
      html += '<div>'
      for (var j = 0; j < question.labels.length; j++) {
        var label_width_perc = 100/(question.labels.length-1);
        var percent_of_range = j * (100/(question.labels.length - 1));
        var percent_dist_from_center = ((percent_of_range-50)/50)*100;
        var offset = (percent_dist_from_center * half_thumb_width)/100;
        html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; '+
        'left:calc('+percent_of_range+'% - ('+label_width_perc+'% / 2) - '+offset+'px); text-align: center; width: '+label_width_perc+'%;">';  
        html += '<span style="text-align: center; font-size: 80%;">'+question.labels[j]+'</span>';
        html += '</div>'
      }
      html += '</div>';
      html += '</div>';
      //html += '</div>';

      // add optional prompt content below slider
      if (question.prompt !== null) {
        html += question.prompt;
      }
    }

    // add submit button
    html += '<br><input type="submit" id="jspsych-survey-slider-response-next" class="jspsych-survey-slider jspsych-btn" value="'+trial.button_label+'" '+ (trial.require_movement ? "disabled" : "") + '></input>';

    html += '</form>';

    display_element.innerHTML = html;

    // has participant moved slider? relevant only when require_movement
    for (var i = 0; i < trial.questions.length; i++) {
      // track which sliders participant has interacted with
      const index = i;
      if (trial.require_movement) {
        display_element.querySelector('[name="Q' + question_order[index] + '"]').addEventListener('click', function() {
          question_ismovement[index] = true;
          if (!question_ismovement.includes(false)) {
            display_element.querySelector('#jspsych-survey-slider-response-next').disabled = false;
          }
        });
      }
    }

    display_element.querySelector('#jspsych-survey-slider-form').addEventListener('submit', function(e) {
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      var question_data = {};
      var matches = display_element.querySelectorAll('#jspsych-survey-slider-form .jspsych-slider');
      for (var index = 0; index < matches.length; index++) {
        var response = matches[index].valueAsNumber;
        var obje = {};
        if (matches[index].attributes['data-name'].value !== '') {
          var name = matches[index].attributes['data-name'].value;
        } else {
          var name = 'Q' + index.toString();
        }
        obje[name] = response;
        Object.assign(question_data, obje);
      }

      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "question_order": JSON.stringify(question_order)
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  };

  return plugin;
})();
