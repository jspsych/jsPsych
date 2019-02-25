/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'survey-text',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        default: undefined,
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Prompts for the subject to response'
          },
          type: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Type',
            default: "text",
            description: 'The type of answer (range, date, text, number)'
          },
          language: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Language',
            default: "spanish",
            description: 'Language of fail-message'
          },
          error_message: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'ErrorMessage',
            default: undefined,
            description: 'Especific text of fail-message'
          },
          answer: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Answer',
            default: undefined,
            description: 'Especific answer'
          },
          value: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Value',
            array: true,
            default: null,
            description: 'The strings will be used to populate the response fields with editable answers.'
          },
          rows: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Rows',
            array: true,
            default: 1,
            description: 'The number of rows for the response text box.'
          },
          columns: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Columns',
            array: true,
            default: 40,
            description: 'The number of columns for the response text box.'
          },
          range: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Range',
            array: true,
            default: [-Infinity, Infinity],
            description: 'The range of int.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'If true, the text box needs a answer.',
          },
          answers_in_text: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Answer in Text',
            default: false,
            description: 'If the question have multiple answers in text.',
          }
        }
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
        description: 'The text that appears on the button to finish the trial.'
      },
      endword: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Input unit',
        default: '',
        description: 'The unit of the input.'
      }
    }
  }

  // this is for conditions on CSCN system
  var conditions = {};
  var trial_questions = {};
  var error_color_list = ["red", "orange", "blue"]

  plugin.trial = function(display_element, trial) {

    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].rows === 'undefined')
        trial.questions[i].rows = 1;
      if (typeof trial.questions[i].columns === 'undefined')
        trial.questions[i].columns = 40;
      if (typeof trial.questions[i].value === 'undefined')
        trial.questions[i].value = "";
      if (typeof trial.questions[i].language === 'undefined')
        trial.questions[i].language = "spanish";
      if (typeof trial.questions[i].endword === 'undefined')
        trial.questions[i].endword = "";
    }

    var html = '<br /><p><br />';
    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
    }

    var min = Array()
    var max = Array()
    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].type == 'undefined') {
        trial.questions[i].type = "text"
      }

      trial.questions[i].list_type = Array()
      trial.questions[i].list_ids = Array()
      trial.questions[i].list_errors = Array()

      if (trial.questions[i].answers_in_text) {
        str = trial.questions[i].prompt
        elements = [];
        // get dicts
        while (1){
          if (str.indexOf("{") === -1)
            break
          var mySubString = str.substring(
            str.indexOf("{") + 1,
            str.indexOf("}")
          );
          elements.push(mySubString);
          str = str.substring(str.indexOf("}") + 1)
        }
        // create inputs
        for (actual_index in elements){
          element_options = elements[actual_index].split(";");
          actual_input = ' <input name="#jspsych-survey-text-response-'+ i.toString() + '"';
          range = false;
          number_question = false;
          actual_min = -Infinity;
          actual_max = Infinity;
          name_selected = false;
          error_selected = false;
          for (actual_option in element_options) {
            if ((element_options[actual_option].replace(/ /g,"")).split(":")[0] === "input"){
              actual_input += "type=" + (element_options[actual_option].replace(/ /g,"")).split(":")[1] + " ";
              trial.questions[i].list_type.push((element_options[actual_option].replace(/ /g,"")).split(":")[1])
              if ((element_options[actual_option].replace(/ /g,"")).split(":")[1] === "number")
                number_question = true
            }
            if ((element_options[actual_option].replace(/ /g,"")).split(":")[0] === "range"){
              actual_input += "min=" + (((element_options[actual_option].replace(/ /g,"")).split(":")[1]).substring(1,4)).split(",")[0] + " ";
              actual_input += "max=" + (((element_options[actual_option].replace(/ /g,"")).split(":")[1]).substring(1,4)).split(",")[1] + " ";
              actual_min = (((element_options[actual_option].replace(/ /g,"")).split(":")[1]).substring(1,4)).split(",")[0]
              actual_max = (((element_options[actual_option].replace(/ /g,"")).split(":")[1]).substring(1,4)).split(",")[1]
            }
            if ((element_options[actual_option].replace(/ /g,"")).split(":")[0] === "name"){
              trial.questions[i].list_ids.push((element_options[actual_option].replace(/ /g,"")).split(":")[1])
              name_selected = true
            }
            if ((element_options[actual_option].replace(/ /g,"")).split(":")[0] === "error_message"){
              trial.questions[i].list_errors.push((element_options[actual_option].split(":")[1]).trim())
              error_selected = true
            }
          }
          if (number_question){
            min.push(actual_min.toString());
            max.push(actual_max.toString());
          }
          if (! (error_selected)){
            trial.questions[i].list_errors.push("")
          }
          if (! (name_selected)){
            trial.questions[i].list_ids.push("input_" + ("0".repeat((((elements.length).toString()).length) - (( parseInt(actual_index) + 1).toString()).length)) + (parseInt(actual_index) + 1).toString())
          }
          actual_input += 'autofocus></input><span class="boxNumber" style="position: relative; top: -10px; font-size: 12px;"></span> ';
          trial.questions[i].prompt = trial.questions[i].prompt.replace("{" + elements[actual_index] + "}", actual_input)
        }
      } else {
        // define the min and max of a question with range
        if (typeof trial.questions[i].range == 'undefined') {
          min.push(-Infinity);
          max.push(Infinity);
        } else {
          min.push(trial.questions[i].range[0]);
          max.push(trial.questions[i].range[1]);
        }
      }

      html += '<div id="jspsych-survey-text-' + i + '" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + trial.questions[i].prompt + '</p>';

      if (!(trial.questions[i].answers_in_text)) {

        if (typeof trial.questions[i].error_message !== 'undefined') {
          trial.questions[i].list_errors.push(trial.questions[i].error_message)
        } else {
          trial.questions[i].list_errors.push("")
        }

        if (typeof trial.questions[i].range != 'undefined' && trial.questions[i].type == 'range')
          html += '<form>'
        html += '<input type="' + trial.questions[0].type + '" name="#jspsych-survey-' + trial.questions[0].type + '-response-' + i;

        if (typeof trial.questions[i].range != 'undefined')
          html += '" min ="' + min[min.length-1] + '" max ="' + max[max.length-1];

        if(trial.questions[i].rows == 1){
          html += '" size="'+trial.questions[i].columns;
        } else {
          html += '" cols="' + trial.questions[i].columns + '" rows="' + trial.questions[i].rows;
        }

        if (typeof trial.questions[i].range != 'undefined' && trial.questions[i].type == 'range')
          html += '" value="0"';
        else
          html += '" value="' + trial.questions[i].value + '"';

        html += ' autofocus';

        if (typeof trial.questions[i].range != 'undefined' && trial.questions[i].type == 'range')
          html += ' class="slider" oninput="this.form.amountInput.value=this.value"';

        html += '></input>';

        if (typeof trial.questions[i].range != 'undefined' && trial.questions[i].type == 'range'){
          html += '&nbsp;&nbsp;<input type="number" name="amountInput" value="0" ';
          if (typeof trial.questions[i].range != 'undefined')
            html += 'min ="' + min[min.length-1] + '" max ="' + max[max.length-1] +'" oninput="this.form[' + "'" + '#jspsych-survey-' + trial.questions[0].type + '-response-' + i + "'" + '].value=this.value" />';
          else
            html += 'min ="0" max ="100" oninput="this.form[' + "'" + '#jspsych-survey-' + trial.questions[0].type + '-response-' + i + "'" + '].value=this.value" />';
        }
        html += trial.questions[i].endword
        if (typeof trial.questions[i].range != 'undefined' && trial.questions[i].type == 'range')
          html += '</form>'
      }
      html += '<p></p></div>';

      // this is for conditions on CSCN system
      trial_questions["Q_"+i.toString()] = trial.questions[i].prompt;
    }

    // this is for conditions on CSCN system
    conditions["Questions"] = trial_questions;

    // add submit button
    html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">'+trial.button_label+'</button><p></p>';
    html += '<div class="fail-message"></div>';
    display_element.innerHTML = html;

    // Focus on first box
    var firstBox = document.getElementsByName('#jspsych-survey-'+ trial.questions[0].type +'-response-0')[0];
    firstBox.focus();

    display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function(event) {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        if ( (typeof (trial.questions[index].answers_in_text) != 'undefined') && (trial.questions[index].answers_in_text)) {
          var val = {}
          for (i = 0; i < matches[index].querySelectorAll('textarea, input').length; i++){
            val[trial.questions[index].list_ids[i]] = matches[index].querySelectorAll('textarea, input')[i].value;
          }
        }
        else{
          var val = matches[index].querySelector('textarea, input').value;
        }
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "conditions": JSON.stringify(conditions) // this is for conditions on CSCN system
      };

      for(var index=0; index<matches.length; index++){
        if ( (typeof (trial.questions[index].answers_in_text) != 'undefined') && (trial.questions[index].answers_in_text)) {
          var val = Array()
          for (i = 0; i < matches[index].querySelectorAll('textarea, input').length; i++)
            val.push(matches[index].querySelectorAll('textarea, input')[i].value);
        }
        else{
          var val = matches[index].querySelector('textarea, input').value;
        }

        if (trial.questions[index].required != 'undefined')
          required = trial.questions[index].required;
        else
          required = false;

        var range_cont = 0
        if (!(Array.isArray(val))) {
          val = [val]
        }
        numbers = document.getElementsByClassName('boxNumber')
        mistakes = []
        for(var actual_val=0; actual_val<val.length; actual_val++)  {
          if ((trial.questions[index].type == "number" || trial.questions[index].type == "range") || ((trial.questions[index].answers_in_text) && trial.questions[index].list_type[actual_val] === "number")){
            range_cont += 1;
          }

          if ((val[actual_val] == "") && required){
            mistakes.push(actual_val);
            document.getElementsByName('#jspsych-survey-'+ trial.questions[index].type +'-response-' + [index])[actual_val].style.border = "1px solid " + error_color_list[ Math.round((( (mistakes.length - 1) / error_color_list.length) - parseInt((mistakes.length - 1)/ error_color_list.length)) * error_color_list.length) ];
            continue
          }
          validation = true
          // next trial and check if is a valid element
          if (trial.questions[index].type == "number" || ( typeof(trial.questions[index].answers_in_text) !== 'undefined') && (trial.questions[index].answers_in_text && trial.questions[index].list_type[actual_val] === "number")) {
            if ((typeof trial.questions[index].range !== 'undefined') || (trial.questions[index].answers_in_text))
              validation = $.isNumeric(val[actual_val]) === true && parseFloat(val[actual_val]) <= parseFloat(max[range_cont-1]) && parseFloat(val[actual_val]) >= parseFloat(min[range_cont-1]);
            else
              validation = $.isNumeric(val[actual_val]) === true;
          }
          if (typeof trial.questions[index].answer !== 'undefined')
            validation = val[actual_val].toString() === (trial.questions[index].answer).toString();

          if (!(validation)){
            mistakes.push(actual_val)
            document.getElementsByName('#jspsych-survey-'+ trial.questions[index].type +'-response-' + [index])[actual_val].style.border = "1px solid " + error_color_list[ Math.round((( (mistakes.length - 1) / 3) - parseInt((mistakes.length - 1)/ 3)) * 3) ];
          } else {
            document.getElementsByName('#jspsych-survey-'+ trial.questions[index].type +'-response-' + [index])[actual_val].style.border = "";
            if (typeof(numbers[actual_val]) !== 'undefined')
              numbers[actual_val].innerHTML = "";
          }
        }
        if (!(mistakes && mistakes.length)) {
          display_element.innerHTML = '';
          jsPsych.pluginAPI.clearAllTimeouts();
          jsPsych.finishTrial(trialdata);
        } else {
          //textBox.blur();
          //textBox.focus();
          display_element.querySelector(".fail-message").innerHTML = ""
          for (var i = 0; i < mistakes.length; i++) {
            if (typeof(numbers[mistakes[i]]) !== 'undefined')
              numbers[mistakes[i]].innerHTML = i + 1
            var message = '';
            if (trial.questions[index].list_errors[mistakes[i]] !== "" ) {
              message = trial.questions[index].list_errors[mistakes[i]]
            } else {
              if (trial.questions[index].language === "english")
                message = 'Please, verify your answer.';
              else if (trial.questions[index].language === "spanish")
                message = 'Por favor, verifique su respuesta.';
            }
            display_element.querySelector(".fail-message").innerHTML += '<span style="color: ' + error_color_list[ Math.round((( i / 3) - parseInt(i/ 3)) * 3) ] + ';" class="required">' + ((typeof(numbers[mistakes[i]]) !== 'undefined') ? ( (i + 1) + ".- " ) : ("")) + message +'</span><br>';
          }
          event.stopPropagation();
          if (event.stopPropagation) {
            event.stopPropagation();
          } else{
            event.cancelBubble = true;
          }
        }
      }
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
