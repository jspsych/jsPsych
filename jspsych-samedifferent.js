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
		trials[i]["answer"] = params["answer"][i];
		if(params["prompt"] != undefined){
			trials[i]["prompt"] = params["prompt"];
		}
		if(params["data"]!=undefined){
			trials[i]["data"] = params["data"][i];
		}
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
			$.fn.jsPsych.showImage($this, trial.b_path, 'sd');
			if(trial.timing[3]!=undefined){
				setTimeout(sd_trial, trial.timing[3], $this, block, trial, part + 1);
			} else {
				sd_trial($this, block, trial, part + 1);
			}
			break;
		case 4:
			if(trial.timing[3]!=undefined){
				$('.sd').remove();
				$this.html(trial.prompt);
			}
			startTime = (new Date()).getTime();
			var resp_func = function(e) {
				var flag = false;
				var correct = false;
				if(e.which=='80') // 'p' key -- same
				{
					flag = true;
					if(trial.answer == "same") { correct = true; }
				} else if(e.which=='81') // 'q' key -- different
				{
					flag = true;
					if(trial.answer == "different"){ correct = true; }
				}
				if(flag)
				{
					endTime = (new Date()).getTime();
					rt = (endTime-startTime);
					var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which}
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					$(document).unbind('keyup',resp_func);
					$('.sd').remove();
					$this.html('');
					setTimeout(function(b){b.next();}, trial.timing[2], block);
				}
			}
			$(document).keyup(resp_func);
			break;
	}
}
	