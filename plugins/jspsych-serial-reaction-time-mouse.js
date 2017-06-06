/**
 * jspsych-serial-reaction-time
 * Josh de Leeuw
 *
 * plugin for running a serial reaction time task
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["serial-reaction-time-mouse"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    trial.grid = trial.grid || [[1,1,1,1]];
    trial.grid_square_size = trial.grid_square_size || 100;
    trial.target_color = trial.target_color || "#999";
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_pre_target = (typeof trial.timing_pre_target === 'undefined') ? 0 : trial.timing_pre_target;
    trial.timing_max_duration = trial.timing_max_duration || -1; // if -1, then wait for response forever
    trial.show_response_feedback = (typeof trial.show_response_feedback === 'undefined') ? true : trial.show_response_feedback;
    trial.feedback_duration = (typeof trial.feedback_duration === 'undefined') ? 50 : trial.feedback_duration;
    trial.fade_duration = (typeof trial.fade_duration === 'undefined') ? -1 : trial.fade_duration;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    var startTime = -1;
    var response = {
      rt: -1,
      row: -1,
      column: -1,
      correct: false
    }

    // display stimulus
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.innerHTML = stimulus;


		if(trial.timing_pre_target <= 0){
			showTarget();
		} else {
			jsPsych.pluginAPI.setTimeout(function(){
				showTarget();
			}, trial.timing_pre_target);
		}

		//show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

		function showTarget(){

      display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).addEventListener('mousedown', function(e){
        if(startTime == -1){
          return;
        } else {
          var info = {}
          info.rt = Date.now() - startTime;
          var node = e.target;
          info.row = parseInt(node.dataset.row);
          info.column = parseInt(node.dataset.column);
          after_response(info);
        }
      });

      startTime = Date.now();

      if(trial.fade_duration == -1){
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.backgroundColor = trial.target_color;
      } else {
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.transition = "background-color "+trial.fade_duration;
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.backgroundColor = trial.target_color;
      }

			if(trial.timing_max_duration > -1){
				jsPsych.pluginAPI.setTimeout(endTrial, trial.timing_max_duration);
			}

		}

    function endTrial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "cell_clicked": JSON.stringify([response.row, response.column]),
				"correct": response.correct,
				"grid": JSON.stringify(trial.grid),
				"target": JSON.stringify(trial.target)
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

    // function to handle responses by the subject
    function after_response(info) {

			// only record first response
      response = response.rt == -1 ? info : response;

			// check if the response is correct
			var responseLoc = [info.row, info.column];
			response.correct = (JSON.stringify(responseLoc) == JSON.stringify(trial.target));

			if (trial.show_response_feedback){
				var color = response.correct ? '#0f0' : '#f00';
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+responseLoc[0]+'-'+responseLoc[1]).style.transition = "";
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+responseLoc[0]+'-'+responseLoc[1]).style.backgroundColor = color;
			}

      if (trial.response_ends_trial) {
        endTrial();
      }
    };

  };

  plugin.stimulus = function(grid, square_size, target, target_color, labels) {
    var stimulus = "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:"+square_size/4+"px'>";
    for(var i=0; i<grid.length; i++){
      stimulus += "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
      for(var j=0; j<grid[i].length; j++){
        var classname = 'jspsych-serial-reaction-time-stimulus-cell';

        stimulus += "<div class='"+classname+"' id='jspsych-serial-reaction-time-stimulus-cell-"+i+"-"+j+"' "+
          "data-row="+i+" data-column="+j+" "+
          "style='width:"+square_size+"px; height:"+square_size+"px; display:table-cell; vertical-align:middle; text-align: center; cursor: pointer; font-size:"+square_size/2+"px;";
        if(grid[i][j] == 1){
          stimulus += "border: 2px solid black;"
        }
        if(typeof target !== 'undefined' && target[0] == i && target[1] == j){
          stimulus += "background-color: "+target_color+";"
        }
        stimulus += "'>";
        if(typeof labels !=='undefined' && labels[i][j] !== false){
          stimulus += labels[i][j]
        }
        stimulus += "</div>";
      }
      stimulus += "</div>";
    }
    stimulus += "</div>";

    return stimulus
  }

  return plugin;
})();
