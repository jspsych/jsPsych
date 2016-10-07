/**
 * jspsych-serial-reaction-time
 * Josh de Leeuw
 *
 * plugin for running a serial reaction time task
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["serial-reaction-time"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    trial.grid = trial.grid || [[1,1,1,1]];
    trial.choices = trial.choices || [['3','5','7','9']];
    trial.grid_square_size = trial.grid_square_size || 100;
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_pre_target = (typeof trial.timing_pre_target === 'undefined') ? 0 : trial.timing_pre_target;
    trial.timing_max_duration = trial.timing_max_duration || -1; // if -1, then wait for response forever
    trial.show_response_feedback = (typeof trial.show_response_feedback === 'undefined') ? true : trial.show_response_feedback;
    trial.feedback_duration = (typeof trial.feedback_duration === 'undefined') ? 50 : trial.feedback_duration;
    trial.fade_duration = (typeof trial.fade_duration === 'undefined') ? -1 : trial.fade_duration;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // create a flattened version of the choices array
    var flat_choices = flatten(trial.choices);

    // display stimulus
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.html(stimulus);

		if(trial.timing_pre_target <= 0){
			showTarget();
		} else {
			jsPsych.pluginAPI.setTimeout(function(){
				showTarget();
			}, trial.timing_pre_target);
		}

		//show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

		var keyboardListener = {};

		function showTarget(){
      if(trial.fade_duration == -1){
        $('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).css('backgroundColor','#999');
      } else {
        $('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).animate({
          'background-color':'#999'
        }, trial.fade_duration);
      }

			keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.flat_choices,
        allow_held_key: false
      });

			if(trial.timing_max_duration > -1){
				jsPsych.pluginAPI.setTimeout(endTrial, trial.timing_max_duration);
			}

		}

    function endTrial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "key_press": response.key,
				"correct": response.correct,
				"grid": JSON.stringify(trial.grid),
				"target": JSON.stringify(trial.target)
      };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

		var response = {
      rt: -1,
      key: false,
      correct: false
    }

    // function to handle responses by the subject
    function after_response(info) {

			// only record first response
      response = response.rt == -1 ? info : response;

			// check if the response is correct
			var responseLoc = [];
			for(var i=0; i<trial.choices.length; i++){
				for(var j=0; j<trial.choices[i].length; j++){
					var t = typeof trial.choices[i][j] == 'string' ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.choices[i][j]) : trial.choices[i][j];
					if(info.key == t){
						responseLoc = [i,j];
						break;
					}
				}
			}

			response.correct = (JSON.stringify(responseLoc) == JSON.stringify(trial.target));

			if (trial.show_response_feedback){
				var color = response.correct ? '#0f0' : '#f00';
				$('#jspsych-serial-reaction-time-stimulus-cell-'+responseLoc[1]+'-'+responseLoc[0]).stop().css('background-color',color);
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
        stimulus += "<div class='jspsych-serial-reaction-time-stimulus-cell' id='jspsych-serial-reaction-time-stimulus-cell-"+i+"-"+j+"' "+
         "style='width:"+square_size+"px; height:"+square_size+"px; display:table-cell; vertical-align:middle; text-align: center; font-size:"+square_size/2+"px;";
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
