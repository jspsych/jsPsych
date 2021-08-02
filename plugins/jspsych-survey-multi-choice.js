/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-multi-choice'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'survey-multi-choice',
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
            description: 'The strings that will be associated with a group of options.'
          },
          options: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Options',
            array: true,
            default: undefined,
            description: 'Displays options for an individual question.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Subject will be required to pick an option for each question.'
          },
          horizontal: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Horizontal',
            default: false,
            description: 'If true, then questions are centered and options are displayed horizontally.'
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
        description: 'HTML formatted string to display at the top of the page above all the questions.'
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
      }
    }
  }
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-survey-multi-choice";

    var html = "";

    // inject CSS for trial
    html += '<style id="jspsych-survey-multi-choice-css">';
    html += ".jspsych-survey-multi-choice-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
      ".jspsych-survey-multi-choice-text span.required {color: darkred;}"+
      ".jspsych-survey-multi-choice-table span.required {color: darkred;}"+
      ".jspsych-survey-multi-choice-table {border-collapse: collapse; width: 100%;}"+
      ".jspsych-survey-multi-choice-table th:empty {visibility: hidden;}"+
      ".jspsych-survey-multi-choice-table td, .jspsych-survey-multi-choice-table th {border: 1px solid lightgray; padding: 5px;}"+
      ".jspsych-survey-multi-choice-table .center {text-align: center;}"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-text {  text-align: center;}"+
      ".jspsych-survey-multi-choice-option { line-height: 2; }"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-survey-multi-choice-text input[type='radio'] {margin-right: 1em;}";
    html += '</style>';

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-multi-choice-preamble" class="jspsych-survey-multi-choice-preamble">'+trial.preamble+'</div>';
    }

    // form element
    if ( trial.autocomplete ) {
    	html += '<form id="jspsych-survey-multi-choice-form">';
    } else {
    	html += '<form id="jspsych-survey-multi-choice-form" autocomplete="off">';
    }
    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }
    
    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {
      
      // get question based on question_order
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];
      
      // create question container
      var question_classes = ['jspsych-survey-multi-choice-question'];
      if (question.horizontal) {
        question_classes.push('jspsych-survey-multi-choice-horizontal');
      }

      html += '<div id="jspsych-survey-multi-choice-'+question_id+'" class="'+question_classes.join(' ')+'"  data-name="'+question.name+'">';

      // add question text
      if (Array.isArray(question.prompt)) {
        html += '<table class="jspsych-survey-multi-choice-table">'
        html += '<thead><tr><th></th>'
        for (var j = 0; j < question.options.length; j++) {
          html += '<th class="center">' + question.options[j] + '</th>'
        }
        html += '</tr></thead>'

        html += '<tbody>'
        for (var k = 0; k < question.prompt.length; k++) {
          html += '<tr><td>' + question.prompt[k] + (question.required ? "<span class='required'>*</span>" : '') + '</td>'
          for (var l = 0; l < question.options.length; l++) {
            var option_id_name = "jspsych-survey-multi-choice-option-" + question_id + "-" + k + '-' + l;
            var input_name = 'jspsych-survey-multi-choice-response-' + question_id + '-' + k;
            var input_id = 'jspsych-survey-multi-choice-response-' + question_id + '-' + k + '-' + l;

            var required_attr = question.required ? 'required' : '';
            html += '<td class="center" id=' + option_id_name + '><label><input type="radio" name="' + input_name + '" id="' + input_id + '" value="' + question.options[l] + '" ' + required_attr + ' /></label></td>'
          }
          html += '</tr>'
        }
        html += '</tbody>'

        html += '</table>'
      } else {
        html += '<p class="jspsych-survey-multi-choice-text survey-multi-choice">' + question.prompt
        if(question.required){
          html += "<span class='required'>*</span>";
        }
        html += '</p>';

        // create option radio buttons
        for (var j = 0; j < question.options.length; j++) {
          // add label and question text
          var option_id_name = "jspsych-survey-multi-choice-option-"+question_id+"-"+j;
          var input_name = 'jspsych-survey-multi-choice-response-'+question_id;
          var input_id = 'jspsych-survey-multi-choice-response-'+question_id+'-'+j;

          var required_attr = question.required ? 'required' : '';

          // add radio button container
          html += '<div id="'+option_id_name+'" class="jspsych-survey-multi-choice-option">';
          html += '<label class="jspsych-survey-multi-choice-text" for="'+input_id+'">';
          html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+question.options[j]+'" '+required_attr+'></input>';
          html += question.options[j]+'</label>';
          html += '</div>';
        }
      }

      html += '</div>';
    }
    
    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    html += '</form>';

    // render
    display_element.innerHTML = html;

    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      for(var i=0; i<trial.questions.length; i++){
        var match = display_element.querySelector('#jspsych-survey-multi-choice-'+i);
        var id = "Q" + i;
        var val;
        if (Array.isArray(trial.questions[question_order[i]].prompt)) {
          val = [];
          for (var m = 0; m < trial.questions[question_order[i]].prompt.length; m++) {
            if (match.querySelector("input[type=radio][name=jspsych-survey-multi-choice-response-" + i + "-" + m + "]:checked") !== null) {
              val.push(match.querySelector("input[type=radio][name=jspsych-survey-multi-choice-response-" + i + "-" + m + "]:checked").value);
            } else {
              val.push("");
            }
          }
        } else {
          if (match.querySelector("input[type=radio]:checked") !== null) {
            val = match.querySelector("input[type=radio]:checked").value;
          } else {
            val = "";
          }
        }
        var obje = {};
        var name = id;
        if(match.attributes['data-name'].value !== ''){
          name = match.attributes['data-name'].value;
        }
        obje[name] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trial_data = {
        rt: response_time,
        response: question_data,
        question_order: question_order
      };
      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  };

  return plugin;
})();
