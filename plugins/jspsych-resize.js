/**
* jspsych-resize
* Steve Chao
*
* plugin for controlling the real world size of the display
*
* documentation: docs.jspsych.org
*
**/

jsPsych.plugins["resize"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // default trial paramters
    trial.item_height = trial.item_height || 1;
    trial.item_width = trial.item_width || 1;
    trial.prompt = trial.prompt || ' ';
    trial.pixels_per_unit = trial.pixels_per_unit ||  100;
    trial.starting_size = trial.starting_size || 100;
    trial.button_label = trial.button_label || "Done";

    var aspect_ratio = trial.item_width / trial.item_height;

    // variables to determine div size
    if(trial.item_width >= trial.item_height){
      var start_div_width = trial.starting_size;
      var start_div_height = Math.round(trial.starting_size / aspect_ratio);
    } else {
      var start_div_height = trial.starting_size;
      var start_div_width = Math.round(trial.starting_size * aspect_ratio);
    }

    // create html for display
    var html ='<div id="jspsych-resize-div" style="border: 2px solid steelblue; height: '+start_div_height+'px; width:'+start_div_width+'px; margin: 7px auto; background-color: lightsteelblue; position: relative;">';
    html += '<div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: steelblue; width: 10px; height: 10px; border: 2px solid lightsteelblue; position: absolute; bottom: 0; right: 0;"></div>';
    html += '</div>';
    html += trial.prompt;
    html += '<a class="jspsych-btn" id="jspsych-resize-btn">'+trial.button_label+'</a>';

    // render
    display_element.innerHTML = html;

    // listens for the click
    document.getElementById("jspsych-resize-btn").addEventListener('click', function() {
      scale();
      end_trial();
    });

    var dragging = false;
    var origin_x, origin_y;
    var cx, cy;

    var mousedownevent = function(e){
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      origin_x = e.pageX;
      origin_y = e.pageY;
      cx = parseInt(scale_div.style.width);
      cy = parseInt(scale_div.style.height);
    }

    display_element.querySelector('#jspsych-resize-handle').addEventListener('mousedown', mousedownevent);

    var mouseupevent = function(e){
      dragging = false;
    }

    document.addEventListener('mouseup', mouseupevent);

    var scale_div = display_element.querySelector('#jspsych-resize-div');

    var resizeevent = function(e){
      if(dragging){
        var dx = (e.pageX - origin_x)*2;
        var dy = (e.pageY - origin_y)*2;

        if(dx >= dy){
          scale_div.style.width = Math.max(10, cx+dx) + "px";
          scale_div.style.height = Math.round(Math.max(10, cx+dx) / aspect_ratio ) + "px";
        } else {
          scale_div.style.height = Math.max(10, cy+dy) + "px";
          scale_div.style.width = Math.round(aspect_ratio * Math.max(10, cy+dy)) + "px";
        }
      }
    }

    document.addEventListener('mousemove', resizeevent);

    // scales the stimulus
    var scale_factor;
    var final_height_px, final_width_px;
    function scale() {
      final_width_px = scale_div.offsetWidth;
      final_height_px = scale_div.offsetHeight;

      var pixels_unit_screen = final_width_px / trial.item_width;

      scale_factor = pixels_unit_screen / trial.pixels_per_unit;
      document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
    };


    // function to end trial
    function end_trial() {

      // clear document event listeners
      document.removeEventListener('mousemove', resizeevent);
      document.removeEventListener('mouseup', mouseupevent);

      // clear the screen
      display_element.innerHTML = '';

      // finishes trial

      var trial_data = {
        'final_height_px': final_height_px,
        'final_width_px': final_width_px,
        'scale_factor': scale_factor
      }

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
