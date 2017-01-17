/**
 * jspsych-test
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['test'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'test',
    description: '',
    parameters: {
      questions: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      options: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      required: {
        type: [jsPsych.plugins.parameterType.BOOL],
        array: true,
        default: false,
        no_function: false,
        description: ''
      },
      horitzontal: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      }
    }
  }
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-test";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // trial defaults
    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    trial.required = typeof trial.required == 'undefined' ? null : trial.required;
    trial.horizontal = typeof trial.required == 'undefined' ? false : trial.horizontal;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // inject CSS for trial
    var node = display_element.innerHTML += '<style id="jspsych-test-css">';
    var cssstr = ".jspsych-test-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
      ".jspsych-test-text span.required {color: darkred;}"+
      ".jspsych-test-horizontal .jspsych-test-text {  text-align: center;}"+
      ".jspsych-test-option { line-height: 2; }"+
      ".jspsych-test-horizontal .jspsych-test-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"

    display_element.querySelector('#jspsych-test-css').innerHTML = cssstr;

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="'+trial_form_id+'"></form>';
    var trial_form = display_element.querySelector("#" + trial_form_id);
    // show preamble text
    var preamble_id_name = _join(plugin_id_name, 'preamble');
    trial_form.innerHTML += '<div id="'+preamble_id_name+'" class="'+preamble_id_name+'">'+trial.preamble+'</div>';

    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {
      // create question container
      var question_classes = [_join(plugin_id_name, 'question')];
      if (trial.horizontal) {
        question_classes.push(_join(plugin_id_name, 'horizontal'));
      }
    
      trial_form.innerHTML += '<div id="'+_join(plugin_id_name, i)+'" class="'+question_classes.join(' ')+'"></div>';
    
      var question_selector = _join(plugin_id_selector, i);
    
      // add question text
      display_element.querySelector(question_selector).innerHTML += '<p class="' + plugin_id_name + '-text test">' + trial.questions[i] + '</p>';

      // create option radio buttons
      for (var j = 0; j < trial.options[i].length; j++) {
        var option_id_name = _join(plugin_id_name, "option", i, j),
          option_id_selector = '#' + option_id_name;
    
        // add image container
        display_element.querySelector(question_selector).innerHTML += '<div id="'+option_id_name+'" class="'+_join(plugin_id_name, 'option')+'"></div>';
    
        // add label and question text
        if(trial.options[i][j].label){
          var label = trial.options[i][j].label;
          var option_label = '<label class="' + plugin_id_name + '-text">' + label + '</label>';
          display_element.querySelector(option_id_selector).innerHTML += option_label;
        } else {
          var option_label = '<label class="' + plugin_id_name + '-text"></label>';
          display_element.querySelector(option_id_selector).innerHTML += option_label;
        }
        // console.log("option label", option_label)
        // var option_label = '<label class="' + plugin_id_name + '-text">'+trial.options[i].url+'</label>';
        // display_element.querySelector(option_id_selector).innerHTML += option_label;

        // create radio button
        // id="jspsych-test-option-0-0"
        display_element.querySelector(option_id_selector + " label").innerHTML =
          '<img id="image" src="'+trial.options[i][j].url+'">' +
          display_element.querySelector(option_id_selector + " label").innerHTML;
      }
    }
    // add submit button
    var matches = display_element.querySelectorAll(".jspsych-test-option");
    console.log("matches", matches)
    matches.forEach(function(currentImageDiv, index){
      console.log("currentimagediv", currentImageDiv)
      currentImageDiv.addEventListener('click', function(event){
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;
        var question_data = {};
        var id = 'answer'
        var val = currentImageDiv.querySelector("#image").src;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
        var trial_data = {
          "rt": response_time,
          "responses": JSON.stringify(question_data)
        };
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      })
      var startTime = (new Date()).getTime();
    })
  };
  return plugin;
})();