/**
 * multiple-slider
 * a jspsych-like plugin for measuring items on a visual analog scale
 *
 * Yoann Julliard
 * Becky Gilbert
 * Inspired by Josh de Leeuw's jspsych-multiple-slider and jspsych-html-slider plugins
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['multiple-slider'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'multiple-slider',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Questions that are associated with the slider.'
          },
          labels: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name:'Labels',
            default: [],
            array: true,
            description: 'Labels of the sliders.',
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
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
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: 500,
        description: 'Width of the slider in pixels.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var w = '100%';

    var html = "";
    // inject CSS for trial
    html += '<style id="jspsych-multiple-slider-css">';
    html += ".jspsych-multiple-slider-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }"+
      ".jspsych-multiple-slider-opts { list-style:none; width:"+w+"; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }"+
      ".jspsych-multiple-slider-opt-label { line-height: 1.1em; color: #444; }"+
      ".jspsych-multiple-slider-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }"+
      ".jspsych-multiple-slider-opts:last-of-type { border-bottom: 0; }"+
      ".jspsych-multiple-slider-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }"+
      ".jspsych-multiple-slider-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
    html += '</style>';

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-multiple-slider-preamble" class="jspsych-multiple-slider-preamble">'+trial.preamble+'</div>';
    }

    if ( trial.autocomplete ) {
      html += '<form id="jspsych-multiple-slider-form">';
    } else {
      html += '<form id="jspsych-multiple-slider-form" autocomplete="off">';
    }

    // add sliders questions ///
    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }

    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      // add question
      html += '<label class="jspsych-multiple-slider-statement">' + question.prompt + '</label>';

      // add labels
      html += '<div id="jspsych-html-slider-response-wrapper" style="margin: 0px 0px;">';
      html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
      html += 'width:'+trial.slider_width+'px;';
      html += '">';
      html += '<div>';
      for(var j=0; j < question.labels.length; j++){
        var width = 100/(question.labels.length-1);
        var left_offset = (j * (100 /(question.labels.length - 1))) - (width/2);
        html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
        html += '<span style="text-align: center; font-size: 80%; color: grey">'+question.labels[j]+'</span>';
        html += '</div>'
      }
      html += '</div>';

      // add some space between sliders and the labels
      html += '<br/>';

      // add sliders
      html += '<input type="range" value="'+question.slider_start+'" min="'+question.min+'" max="'+question.max+'" step="'+question.step+'" style="width: 100%;" class="jspsych-html-slider-response-response" id="jspsych-html-slider-response-response-'+i+'" name="Q'+i+'" data-name="'+question.name+'"></input>';
      // add some space between the sliders
      html += '<br/>';
    }

    // add some space before the next button
    html += '<br/>'

    // add submit button
    html += '<input type="submit" id="jspsych-multiple-slider-next" class="jspsych-multiple-slider jspsych-btn" value="'+trial.button_label+'"></input>';

    html += '</form>'

    display_element.innerHTML = html;

    // require responses
    if (trial.require_movement) {
      // disable by default the next button
      document.getElementById('jspsych-multiple-slider-next').disabled = true;

      // check whether all sliders have been clicked
      function check_reponses() {
        var all_sliders = document.querySelectorAll('.jspsych-html-slider-response-response');
        var all_clicked = true;
        for (var i=0; i<all_sliders.length; i++) {
            if (!all_sliders[i].classList.contains("clicked")) {
                // if any one slider doesn't have the 'clicked' class, then we know that they haven't all been clicked
                all_clicked = false;
                break;
            }
        }
        if (all_clicked) {
          // if they have been clicked then enable the next button
          document.getElementById('jspsych-multiple-slider-next').disabled = false;
        }
      }

      var all_sliders = document.querySelectorAll('.jspsych-html-slider-response-response');
      all_sliders.forEach(function(slider) {
          slider.addEventListener('click', function() {
            slider.classList.add("clicked"); // record the fact that this slider has been clicked
            check_reponses(); // each time a slider is clicked, check to see if they've all been clicked
          });
      });
    }

    display_element.querySelector('#jspsych-multiple-slider-form').addEventListener('submit', function(e){
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};

      // hold responses
      var matches = display_element.querySelectorAll('input[type="range"]');


      // store responses
      for(var index = 0; index < matches.length; index++){
        var id = matches[index].name;
        var response = matches[index].valueAsNumber;
        var obje = {};
        if(matches[index].attributes['data-name'].value !== ''){
          var name = matches[index].attributes['data-name'].value;
        } else {
          var name = id;
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
