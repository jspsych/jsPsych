function xab_create(params)
{
	//xab_stims = shuffle(xab_stims);
	xab_stims = params["stimuli"];
	trials = new Array(xab_stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "xab";
		trials[i]["a_path"] = xab_stims[i][0];
		trials[i]["b_path"] = xab_stims[i][1];
		trials[i]["timing"] = params["timing"];
	}
	return trials;
}

function xab_trial($this, block, trial, part)
{
	switch(part){
		case 1:
			$.fn.jsPsych.showImage($this, trial.a_path, 'xab');
			setTimeout(xab_trial, trial.timing[0], $this, block, trial, part + 1);
			break;
		case 2:
			$('.xab').remove();
			setTimeout(xab_trial, trial.timing[1], $this, block, trial, part + 1);
			break;
		case 3:
			startTime = (new Date()).getTime();
			var images = [trial.a_path,trial.b_path];
			var target_left = (Math.floor(Math.random()*2)==0); // binary true/false choice
			if(!target_left){
				images = [trial.b_path, trial.a_path];
			}
			$.fn.jsPsych.showImages($this, images, 'xab');
			var resp_func = function(e) {
				var flag = false;
				var correct = false;
				if(e.which=='80') // 'p' key
				{
					flag = true;
					if(!target_left) { correct = true; }
				} else if(e.which=='81') // 'q' key
				{
					flag = true;
					if(target_left){ correct = true; }
				}
				if(flag)
				{
					endTime = (new Date()).getTime();
					rt = (endTime-startTime);
					block.data[block.trial_idx] = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "keypress": e.which}
					$(document).unbind('keyup',resp_func);
					$('.xab').remove();
					setTimeout(function(b){b.next();}, trial.timing[2], block);
				}
			}
			$(document).keyup(resp_func);
			//TODO: CHECK IF IMAGE SHOULD DISAPPEAR
			//based on timings
			break;
	}
}