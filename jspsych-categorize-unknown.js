// timing parameters: [intertrial gap, optional length to display target]
// if optional length to display target is missing, then target is displayed until subject responds.

function cu_create(params)
{
	cu_stims = params["stimuli"];
	trials = new Array(cu_stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "cu";
		trials[i]["a_path"] = cu_stims[i];
		trials[i]["timing"] = params["timing"];
		trials[i]["choices"] = params["choices"];
		if(params["prompt"] != undefined){
			trials[i]["prompt"] = params["prompt"];
		}
		if(params["data"]!=undefined){
			trials[i]["data"] = params["data"][i];
		}
	}
	return trials;
}

function cu_trial($this, block, trial, part)
{
	switch(part){
		case 1:
			p1_time = (new Date()).getTime();
			$.fn.jsPsych.showImage($this, trial.a_path, 'cu');
			if(trial.timing[1]!=undefined){
				setTimeout(cu_trial, trial.timing[1], $this, block, trial, part + 1);
			} else {
				//show prompt here
				$this.append(trial.prompt);
				cu_trial($this, block, trial, part + 1);
			}
			break;
		case 2:
			p2_time = (new Date()).getTime();
			if(trial.timing[1]!=undefined){
				$('.cu').remove();
				$this.html(trial.prompt);
			}
			startTime = (new Date()).getTime();
			var resp_func = function(e) {
				var flag = false;
				// check if the key is any of the options, or if it is an accidental keystroke
				for(var i=0;i<trial.choices.length;i++)
				{
					if(e.which==trial.choices[i])
					{ 
						flag = true;
					}
				}
				if(flag)
				{
					endTime = (new Date()).getTime();
					rt = (endTime-startTime);
					stim1_time = (p2_time-p1_time);
					var trial_data = {"rt": rt, "a_path": trial.a_path, "key_press": e.which, "stim1_time": stim1_time}
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					$(document).unbind('keyup',resp_func);
					$('.cu').remove();
					$this.html('');
					setTimeout(function(b){b.next();}, trial.timing[0], block);
				}
			}
			$(document).keyup(resp_func);
			break;
	}
}
	