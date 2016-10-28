/**
 * jspsych-form
 * The form plugin displays a form element from either the same document or loads it from a different url. After submission all form fields are stored with the trial_data according to a no longer maintained W3C note regarding the conversion from form data to json objects: https://www.w3.org/TR/html-json-forms/.
 *
 * Wolfgang Walther
 * October 2016
 *
 */


jsPsych.plugins.form = (function() {

  var plugin = {};

  plugin.info = {
    name: 'form',
    description: 'The form plugin displays a form element from either the same document or loads it from a different url.',
    parameters: {
      url: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: 'The URL of the file to read form from. If empty, form is read from current document.'
      },
      container: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: 'DOM selector for the element holding the form. The contents of the first selected element will be displayed. The first form element found will be activated for the trial.'
      },
      load_fn: {
        type: [jsPsych.plugins.parameterType.FUNCTION],
        default: 'function(html) { return html; }',
        no_function: false,
        description: 'Form load callback. Given the html string of the form to load. Return the modified html string to be used by the plugin. Can be used for templating.'
      },
      check_fn: {
        type: [jsPsych.plugins.parameterType.FUNCTION],
        default: 'function() { return true; }',
        no_function: false,
        description: 'Form validation callback. Given the trial_data object with all form values and the form node as arguments. Return true to finish trial, return false to cancel.'
      },
      force_refresh: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: 'Force to load the file from the server again by appending a current timestamp to the url.'
      }
    }
  }

  // Implements https://www.w3.org/TR/html-json-forms/
  // Modified from: https://github.com/roman01la/JSONFormData/blob/master/src/json-formdata.js
  /* Perform full evaluation on path and set value */
  var putFormData = function(path, value, type, data) {
    
    /* Determine what kind of accessor we are dealing with */
    var getAccessorType = function(key) {
      return (key === '[]' || typeof key === 'number' && key % 1 === 0) ? 'array' : 'object';
    };
    
    var accessorRegex = /\[(.*?)]/g,
      matches,
      accessors = [],
      firstKey = path.match(/(.+?)\[/);

    if(firstKey === null) {
      firstKey = path;
    } else {
      firstKey = firstKey[1];
    }

    /* use coerced integer value if we can */
    value = (type === 'number') ? parseInt(value, 10) : value;

    while ((matches = accessorRegex.exec(path))) {

      /* If this is blank then we're using array append syntax
         If this is an integer key, save it as an integer rather than a string. */
      var parsedMatch = parseInt(matches[1], 10);
      if(matches[1] === '') {
        accessors.push('[]');
      } else if (parsedMatch == matches[1]) {
        accessors.push(parsedMatch);
      } else {
        accessors.push(matches[1]);
      }
    }

    if(accessors.length > 0) {
      var accessor = accessors[0];
      var accessorType = getAccessorType(accessors[0]);
      var formDataTraverser;

      if(typeof data[firstKey] === 'undefined') {
        if(accessorType === 'object') {
          data[firstKey] = {};
        } else {
          data[firstKey] = [];
        }
      } else {
        if(typeof data[firstKey] !== 'object') {
          data[firstKey] = {'':data[firstKey]};
        }
      }

      formDataTraverser = data[firstKey];
      for (var i = 0; i < accessors.length - 1; i++) {
        accessorType = getAccessorType(accessors[i + 1]);
        accessor = accessors[i];

        if(typeof formDataTraverser[accessor] === 'undefined') {
          if(accessorType === 'object') {
            formDataTraverser[accessor] = {};
          } else {
            formDataTraverser[accessor] = [];
          }
        }

        if(typeof formDataTraverser[accessor] !== 'object' && i < accessors.length - 1) {
          formDataTraverser[accessor] = {'': formDataTraverser[accessor]};
        }

        formDataTraverser = formDataTraverser[accessor];
      }

      var finalAccessor = accessors[accessors.length - 1];
      if(finalAccessor === '[]') {
        formDataTraverser.push(value);
      } else if(typeof formDataTraverser[finalAccessor] === 'undefined') {
        formDataTraverser[finalAccessor] = value;
      } else if(formDataTraverser[finalAccessor] instanceof Array) {
        formDataTraverser[finalAccessor].push(value);
      } else {
        formDataTraverser[finalAccessor] = [formDataTraverser[finalAccessor], value];
      }
    } else {
      if(typeof data[firstKey] === 'undefined') {
        data[firstKey] = value;
      } else if(data[firstKey] instanceof Array) {
        data[firstKey].push(value);
      } else {
        data[firstKey] = [data[firstKey], value];
      }
    }
  };

  plugin.trial = function(display_element, trial) {
    
    // don't use jQuery
    display_element = display_element[0];

    // default parameters
    trial.url = typeof trial.url === 'undefined' ? '' : trial.url;
    trial.load_fn = trial.load_fn || function(html) { return html; };
    trial.check_fn = trial.check_fn || function() { return true; };
    trial.force_refresh = (typeof trial.force_refresh === 'undefined') ? false : trial.force_refresh;
    
    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial, ['load_fn', 'check_fn']);

    // add current time to url to force refresh
    var url = trial.url;
    if (trial.force_refresh) {
      url = trial.url + '?time=' + (new Date().getTime());
    }
    
    // initialize the form
    var initForm = function(html) {
      
      // call load callback to template the form
      display_element.innerHTML = trial.load_fn(html);
      
      // Let's go
      var startTime = (new Date()).getTime();
      
      // find the first form
      var formNodes = display_element.getElementsByTagName('form');
      if(formNodes.length > 0) {
        var formNode = formNodes[0];
      } else {
        console.error('jsPsych-plugin-form: form element not found.');
        return;
      }
      
      // handle the submit
      var submitForm = function(event) {
        // dont submit form to server
        event.preventDefault();
        
        // save data
        var trial_data = {
          rt: (new Date()).getTime() - startTime,
          url: url,
          container: trial.container,
        };
        
        // go through form elements and save data
        [].forEach.call(formNode.elements, function(field) {
          // only continue if both name and value are set
          if(!field.name || !field.value) return;
          
          // omit disabled fields
          if(field.disabled) return;
          
          // Read form data and put into trial_data variables
          switch(field.type) {
            case 'file':
              // files are not supported
              return;
            case 'select-multiple':
              [].forEach.call(field.selectedOptions, function(option) {
                putFormData(field.name + '[]', option.value, field.type, trial_data);
              });
              break;
            case 'checkbox':
            case 'radio':
              if(!field.checked) return;
              // **** FALLTHROUGH ****
            default:
              putFormData(field.name, field.value, field.type, trial_data);
          }
        });
        
        // validate form input
        if (trial.check_fn && !trial.check_fn(trial_data, formNode)) return;
        
        // Clear screen
        display_element.innerHTML = '';
        
        // next trial
        jsPsych.finishTrial(trial_data);
      };
      
      // Add event listener to onsubmit
      formNode.addEventListener('submit', submitForm, false);
    };
    
    // if url is set, load from file
    if(url !== '') {
      // load file and get container
      var http = new XMLHttpRequest();
      http.onreadystatechange = function() {
        if(http.readyState == XMLHttpRequest.DONE) {
          switch(http.status) {
            case 200:
              // get container and init form
              var doc = document.createElement('div');
              doc.innerHTML = http.responseText;
              var container = doc.querySelector(trial.container);
              initForm(container.innerHTML);
              break;
            default:
              console.error('HTTP Request returned ' + http.status + '.')
          }
        }
      };
      http.open('GET', url, true);
      http.send();
    } else {
      // load from within current document
      initForm(document.querySelector(trial.container).innerHTML);
    }
  };

  return plugin;
})();
