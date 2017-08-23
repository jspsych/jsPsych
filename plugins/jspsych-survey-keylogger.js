/**
 * jspsych-survey-text
 * a jspsych plugin for collecting keystroke events' data based on jspsych-survey-text
 *
 * Davi Alves Oliveira
 *
 */


jsPsych.plugins['survey-keylogger'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-keylogger',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {type: jsPsych.plugins.parameterType.STRING,
                   pretty_name: 'Prompt',
                   default: undefined,
                   description: 'Prompts for the the subject to response'},
          value: {type: jsPsych.plugins.parameterType.STRING,
                  pretty_name: 'Value',
                  array: true,
                  default: '',
                  description: 'The strings will be used to populate the response fields with editable answers.'}, 
          rows: {type: jsPsych.plugins.parameterType.INT,
                 pretty_name: 'Rows',
                 array: true,
                 default: 1,
                 description: 'The number of rows for the response text box.'}, 
          columns: {type: jsPsych.plugins.parameterType.INT,
                    pretty_name: 'Columns',
                    array: true,
                    default: 40,
                    description: 'The number of columns for the response text box.'}
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: '',
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default: 'Next',
        description: 'The text that appears on the button to finish the trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    //keylogger variables
    var keylog = {};
    var processedData = "";
    var first = true;
    var now;
    var previousTime;
    var shiftDown = false;
    var keys = {8:"<span class=\"glyphicon glyphicon-step-backward text-danger small\"></span>",
      9:"<kbd class=\"bg-primary small\">Tab</kbd>",
      13:"<span class=\"text-info\">&para;</span>",
      17:"<kbd class=\"bg-primary small\">Ctrl</kbd>",
      18:"<kbd class=\"bg-primary small\">Alt</kbd>",
      20:"<kbd class=\"bg-primary small\">Caps Lock</kbd>",
      "^20":"<kbd class=\"bg-primary small\">Caps Lock</kbd>",
      27:"<kbd class=\"bg-primary small\">Esc</kbd>",
      32:"&middot;",
      "^32":"&middot;",
      33:"<kbd class=\"bg-primary small\">Page Up</kbd>",
      34:"<kbd class=\"bg-primary small\">Page Down</kbd>",
      35:"<kbd class=\"bg-primary small\">End</kbd>",
      36:"<kbd class=\"bg-primary small\">Home</kbd>",
      37:"<span class=\"glyphicon glyphicon-arrow-left text-info small\"></span>",
      38:"<span class=\"glyphicon glyphicon-arrow-up text-info small\"></span>",
      39:"<span class=\"glyphicon glyphicon-arrow-right text-info small\"></span>",
      40:"<span class=\"glyphicon glyphicon-arrow-down text-info small\"></span>",
      46:"<span class=\"glyphicon glyphicon-step-forward text-danger small\"></span>",
      48:"0",
      "^48":")",
      49:"1",
      "^49":"!",
      50:"2",
      "^50":"@",
      51:"3",
      "^51":"#",
      52:"4",
      "^52":"$",
      53:"5",
      "^53":"%",
      54:"6",
      "^54":"&#776;",
      55:"7",
      "^55":"&",
      56:"8",
      "^56":"*",
      57:"9",
      "^57":"(",
      65:"a",
      "^65":"A",
      66:"b",
      "^66":"B",
      67:"c",
      "^67":"C",
      68:"d",
      "^68":"D",
      69:"e",
      "^69":"E",
      70:"f",
      "^70":"F",
      71:"g",
      "^71":"G",
      72:"h",
      "^72":"H",
      73:"i",
      "^73":"I",
      74:"j",
      "^74":"J",
      75:"k",
      "^75":"K",
      76:"l",
      "^76":"L",
      77:"m",
      "^77":"M",
      78:"n",
      "^78":"N",
      79:"o",
      "^79":"O",
      80:"p",
      "^80":"P",
      81:"q",
      "^81":"Q",
      82:"r",
      "^82":"R",
      83:"s",
      "^83":"S",
      84:"t",
      "^84":"T",
      85:"u",
      "^85":"U",
      86:"v",
      "^86":"V",
      87:"w",
      "^87":"W",
      88:"x",
      "^88":"X",
      89:"y",
      "^89":"Y",
      90:"z",
      "^90":"Z",
      91:"<kbd class=\"bg-primary small\">Windows</kbd>",
      93:"<kbd class=\"bg-primary small\">Menu</kbd>",
      112:"<kbd class=\"bg-primary small\">F1</kbd>",
      113:"<kbd class=\"bg-primary small\">F2</kbd>",
      114:"<kbd class=\"bg-primary small\">F3</kbd>",
      115:"<kbd class=\"bg-primary small\">F4</kbd>",
      117:"<kbd class=\"bg-primary small\">F6</kbd>",
      118:"<kbd class=\"bg-primary small\">F7</kbd>",
      119:"<kbd class=\"bg-primary small\">F8</kbd>",
      120:"<kbd class=\"bg-primary small\">F9</kbd>",
      121:"<kbd class=\"bg-primary small\">F10</kbd>",
      122:"<kbd class=\"bg-primary small\">F11</kbd>",
      123:"<kbd class=\"bg-primary small\">F12</kbd>",
      186:"ç",
      "^186":"Ç",
      187:"=",
      "^187":"+",
      188:",",
      "^188":"<",
      189:"-",
      "^189":"_",
      190:".",
      "^190":">",
      191:";",
      "^191":":",
      192:"'",
      "^192":"\"",
      193:"/",
      "^193":"?",
      219:"<kbd class=\"bg-primary small\">&#180;</kbd>",
      "^219":"<kbd class=\"bg-primary small\">`</kbd>",
      220:"]",
      "^220":"}",
      221:"[",
      "^221":"{",
      222:"<kbd class=\"bg-primary small\">~</kbd>",
      "^222":"<kbd class=\"bg-primary small\">^</kbd>",
      226:"<kbd class=\"bg-primary small\">\</kbd>",
      "^226":"<kbd class=\"bg-primary small\">|</kbd>"};


    if (typeof trial.questions[0].rows == 'undefined') {
      trial.questions[0].rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.questions[i].rows.push(1);
      }
    }
    if (typeof trial.questions[0].columns == 'undefined') {
      trial.questions[0].columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.questions[i].columns.push(40);
      }
    }
    if (typeof trial.questions[0].value == 'undefined') {
      trial.questions[0].value = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.questions[i].value.push("");
      }
    }

    // show preamble text
    var html = '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      html += '<div id="jspsych-survey-text-"'+i+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + trial.questions[i].prompt + '</p>';
      if(trial.questions[i].rows == 1){
        html += '<input type="text" id="jspsych-survey-text-response-' + i + '" name="#jspsych-survey-text-response-' + i + '" size="'+trial.questions[i].columns+'">'+trial.questions[i].value+'</input>';
      } else {
        html += '<textarea id="jspsych-survey-text-response-' + i + '" name="#jspsych-survey-text-response-' + i + '" cols="' + trial.questions[i].columns + '" rows="' + trial.questions[i].rows + '">'+trial.questions[i].value+'</textarea>';
      }
      html += '</div>';
    }

    // add submit button
    html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    //keylogger
    //check if shift is pressed
    document.body.addEventListener('keyup', function (e) {
      if (e.which === 16) {
        shiftDown = false;
      }
    });

    for (var i = 0; i < trial.questions.length; i++) {
      display_element.querySelector('#jspsych-survey-text-response-' + i).addEventListener('keydown', function (e) {
        if (e.which === 20) {
          shiftDown = !shiftDown;
        }

        if (e.which !== 16 && e.which !== 229) {
          now = (new Date()).getTime();
          keylog[now] = keys[(shiftDown ? "^" : "") + e.which];

          //processed keylogging data
          if (first) {
            processedData += keylog[now];
            previousTime = now;
            first = false;
          } else {
            time = now - previousTime;
              processedData += "<span title='" + time + "'>" + new Array(Math.floor(time/(time < 4000 ? 400 : 4000)) + 1).join((time < 4000 ? "<span class=\"glyphicon glyphicon-time small text-warning\"></span>" : "<span class=\"glyphicon glyphicon-hourglass small text-danger\"></span>")) + "</span>" + keylog[now];
              previousTime = now;
          }
        } else if (e.which === 16) {
          shiftDown = true;
        }
      });
    }

    display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        var val = matches[index].querySelector('textarea, input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "keylog_raw": keylog,
        "keylog_processed": "<p class='keylog-processed'>" + processedData + "</p>"
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
