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
			p1_time = (new Date()).getTime();
			$this.append($('<img>', {
				"src": trial.a_path,
				"class": 'sd'
			}));
			setTimeout(function(){sd_trial($this, block, trial, part + 1);}, trial.timing[0]);
			break;
		case 2:
			p2_time = (new Date()).getTime();
			$('.sd').remove();
			setTimeout(function(){sd_trial($this, block, trial, part + 1);}, trial.timing[1]);
			break;
		case 3:
			p3_time = (new Date()).getTime();
			$this.append($('<img>', {
				"src": trial.b_path,
				"class": 'sd'
			}));
			if(trial.timing[3]!=undefined){
				setTimeout(function(){sd_trial($this, block, trial, part + 1);}, trial.timing[3]);
			} else {
				sd_trial($this, block, trial, part + 1);
			}
			break;
		case 4:
			p4_time = (new Date()).getTime();
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
					stim1_time = (p2_time-p1_time);
					isi_time = (p3_time-p2_time);
					stim2_time = (p4_time-p3_time);
					var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which, "stim1_time": stim1_time, "stim2_time":stim2_time, "isi_time":isi_time}
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					$(document).unbind('keyup',resp_func);
					$('.sd').remove();
					$this.html('');
					setTimeout(function(){block.next();}, trial.timing[2]);
				}
			}
			$(document).keyup(resp_func);
			break;
	}
}
	