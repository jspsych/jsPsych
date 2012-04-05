// jsPsych plugin for showing animations
// Josh de Leeuw

function animation_create(params)
{
	stims = params["stimuli"];
	trials = new Array(stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "animate";
		trials[i]["stims"] = stims[i];
		trials[i]["frame_time"] = params["frame_time"];
		trials[i]["repetitions"] = params["repetitions"];
		trials[i]["timing"] = params["timing"];
	}
	return trials;
}

function animation_trial($this, block, trial, part)
{
	animate_frame = -1;
	reps = 0;
	switch(part)
	{
		case 1:
			animate_interval = setInterval(function(){
				showImage = true;
				$('.animate').remove();
				animate_frame++;
				if(animate_frame == trial.stims.length)
				{
					animate_frame = 0;
					reps++;
					if(reps >= trial.repetitions)
					{
						animation_trial($this, block, trial, part + 1);
						clearInterval(animate_interval);
						showImage = false;
					}
				}
				if(showImage){
					$.fn.jsPsych.showImage($this, trial.stims[animate_frame], 'animate');
				}
			}, trial.frame_time);
			break;
		case 2:
			setTimeout(function(b){ b.next(); }, trial.timing[0], block);
			break;
	}			
}