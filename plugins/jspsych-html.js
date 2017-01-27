/** (July 2012, Erik Weitnauer)
The html-plugin will load and display an arbitrary number of html pages. To proceed to the next, the
user might either press a button on the page or a specific key. Afterwards, the page get hidden and
the plugin will wait of a specified time before it proceeds.

documentation: docs.jspsych.org
*/

jsPsych.plugins.html = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html',
    description: '',
    parameters: {
      url: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      cont_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: null,
        no_function: false,
        description: ''
      },
      cont_btn: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: null,
        no_function: false,
        description: ''
      },
      check_fn: {
        type: [jsPsych.plugins.parameterType.FUNCTION],
        default: 'function() { return true; }',
        no_function: false,
        description: ''
      },
      force_refresh: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.check_fn = trial.check_fn || function() { return true; }
    trial.force_refresh = (typeof trial.force_refresh === 'undefined') ? false : trial.force_refresh

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial, ["check_fn"]);

    var url = trial.url;
    if (trial.force_refresh) {
      url = trial.url + "?time=" + (new Date().getTime());
    }

    load(display_element, url, function() {
      var t0 = (new Date()).getTime();
      var finish = function() {
        if (trial.check_fn && !trial.check_fn(display_element)) { return };
        if (trial.cont_key) { document.removeEventListener('keydown', key_listener); }
        var trial_data = {
          rt: (new Date()).getTime() - t0,
          url: trial.url
        };
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      };
      if (trial.cont_btn) { display_element.querySelector('#'+trial.cont_btn).addEventListener('click', finish); }
      if (trial.cont_key) {
        var key_listener = function(e) {
          if (e.which == trial.cont_key) finish();
        };
        display_element.addEventListener('keydown', key_listener);
      }
    });
  };

  // helper to load via XMLHttpRequest
  function load(element, file, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file, true);
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4){ //Check if loaded
            element.innerHTML = xmlhttp.responseText;
            callback();
        }
    }
    xmlhttp.send();
  }

  return plugin;
})();
