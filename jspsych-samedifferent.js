function sd_create(params)
{
	sd_stims = params["stimuli"];
	trials = new Array(sd_stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "sd";
		trials[i]["a_path"] = sd_stims[i][0];
		trials[i]["b_path"] = sd_stims[i][1];
		trials[i]["timing"] = params["timing"];
	}
	return trials;
}

function sd_trial($this, block, trial, part)
{
	switch(part){
		case 1:
			$.fn.jsPsych.showImage($this, trial.a_path, 'sd');
			setTimeout(sd_trial, trial.timing[0], $this, block, trial, part + 1);
			break;
		case 2:
			$('.sd').remove();
			setTimeout(sd_trial, trial.timing[1], $this, block, trial, part + 1);
			break;
		case 3:
			startTime = (new Date()).getTime();
			$.fn.jsPsych.showImage($this, trial.b_path, 'sd');
			var resp_func = function(e) {
				var flag = false;
				var correct = false;
				if(e.which=='80') // 'p' key -- different
				{
					flag = true;
					if(trial.a_path!=trial.b_path) { correct = true; }
				} else if(e.which=='81') // 'q' key -- same
				{
					flag = true;
					if(trial.a_path==trial.b_path){ correct = true; }
				}
				if(flag)
				{
					endTime = (new Date()).getTime();
					rt = (endTime-startTime);
					block.data[block.trial_idx] = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path}
					$(document).unbind('keyup',resp_func);
					$('.sd').remove();
					setTimeout(function(b){b.next();}, trial.timing[2], block);
				}
			}
			$(document).keyup(resp_func);
			break;
	}
}
	