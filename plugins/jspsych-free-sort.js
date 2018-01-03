/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-sort'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort', 'stimuli', 'image');

  plugin.info = {
    name: 'free-sort',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'Images to be displayed.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus height',
        default: 100,
        description: 'Height of images in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus width',
        default: 100,
        description: 'Width of images in pixels'
      },
      sort_area_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area height',
        default: 800,
        description: 'The height of the container that subjects can move the stimuli in.'
      },
      sort_area_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area width',
        default: 800,
        description: 'The width of the container that subjects can move the stimuli in.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
      },
      prompt_location: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Prompt location',
        options: ['above','below'],
        default: 'above',
        description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to continue to the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var start_time = (new Date()).getTime();

    var html = "";
    // check if there is a prompt and if it is shown above
    if (trial.prompt !== null && trial.prompt_location == "above") {
      html += trial.prompt;
    }

    html += '<div '+
      'id="jspsych-free-sort-arena" '+
      'class="jspsych-free-sort-arena" '+
      'style="position: relative; width:'+trial.sort_area_width+'px; height:'+trial.sort_area_height+'px; border:2px solid #444;"'+
      '></div>';

    // check if prompt exists and if it is shown below
    if (trial.prompt !== null && trial.prompt_location == "below") {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // store initial location data
    var init_locations = [];

    for (var i = 0; i < trial.stimuli.length; i++) {
      var coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height - trial.stim_height);

      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img '+
        'src="'+trial.stimuli[i]+'" '+
        'data-src="'+trial.stimuli[i]+'" '+
        'class="jspsych-free-sort-draggable" '+
        'draggable="false" '+
        'style="position: absolute; cursor: move; width:'+trial.stim_width+'px; height:'+trial.stim_height+'px; top:'+coords.y+'px; left:'+coords.x+'px;">'+
        '</img>';

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
    }

    display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" class="jspsych-btn">'+trial.button_label+'</button>';

    var maxz = 1;

    var moves = [];

    var draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable');

    for(var i=0;i<draggables.length; i++){
      draggables[i].addEventListener('mousedown', function(event){
        var x = event.pageX - event.currentTarget.offsetLeft;
        var y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
        var elem = event.currentTarget;
        elem.style.zIndex = ++maxz;

        var mousemoveevent = function(e){
          elem.style.top =  Math.min(trial.sort_area_height - trial.stim_height, Math.max(0,(e.clientY - y))) + 'px';
          elem.style.left = Math.min(trial.sort_area_width  - trial.stim_width,  Math.max(0,(e.clientX - x))) + 'px';
        }
        document.addEventListener('mousemove', mousemoveevent);

        var mouseupevent = function(e){
          document.removeEventListener('mousemove', mousemoveevent);
          moves.push({
            "src": elem.dataset.src,
            "x": elem.offsetLeft,
            "y": elem.offsetTop
          });
          document.removeEventListener('mouseup', mouseupevent);
        }
        document.addEventListener('mouseup', mouseupevent);
      });
    }

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){

      var end_time = (new Date()).getTime();
      var rt = end_time - start_time;
      // gather data
      // get final position of all objects
      var final_locations = [];
      var matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
      for(var i=0; i<matches.length; i++){
        final_locations.push({
          "src": matches[i].dataset.src,
          "x": matches[i].style.position.left,
          "y": matches[i].style.position.top
        });
      }

      var trial_data = {
        "init_locations": JSON.stringify(init_locations),
        "moves": JSON.stringify(moves),
        "final_locations": JSON.stringify(final_locations),
        "rt": rt
      };

      // advance to next part
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    });

  };

  // helper functions

  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  return plugin;
})();
