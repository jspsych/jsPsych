function xab_touch_create(params)
{
	//xab_stims = shuffle(xab_stims);
	xab_stims = params["stimuli"];
	trials = new Array(xab_stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "xab_touch";
		trials[i]["a_path"] = xab_stims[i][0];
		trials[i]["b_path"] = xab_stims[i][1];
		trials[i]["timing"] = params["timing"];
		if(params["data"]!=undefined){
			trials[i]["data"] = params["data"][i];
		}
	}
	return trials;
}

function xab_touch_trial($this, block, trial, part)
{
	switch(part){
		case 1:
			p1_time = (new Date()).getTime();
			$.fn.jsPsych.showImage($this, trial.a_path, 'xab_touch');
			setTimeout(xab_touch_trial, trial.timing[0], $this, block, trial, part + 1);
			break;
		case 2:
			p2_time = (new Date()).getTime();
			$('.xab_touch').remove();
			setTimeout(xab_touch_trial, trial.timing[1], $this, block, trial, part + 1);
			break;
		case 3:
			p3_time = (new Date()).getTime();
			startTime = (new Date()).getTime();
			var images = [trial.a_path, trial.b_path];
			var target_left = (Math.floor(Math.random()*2)==0); // binary true/false choice
			if(!target_left){
				images = [trial.b_path, trial.a_path];
			}
			//$.fn.jsPsych.showImages($this, images, 'xab');
			
			var correct=false;
			
			var left_img = document.createElement('img');
			left_img.setAttribute('src', images[0]);
			left_img.setAttribute('class', 'xab_touch');
			left_img.setAttribute('id','left_img');
			$this.append(left_img);
			$("#left_img").click(function() {
				if(target_left) { correct = true; }
				
				endTime = (new Date()).getTime();
				rt = (endTime-startTime);
				stim1_time = (p2_time-p1_time);
				isi_time = (p3_time-p2_time);
				var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "stim1_time": stim1_time, "isi_time":isi_time}
				block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
				$('.xab_touch').remove();
				setTimeout(function(b){b.next();}, trial.timing[2], block);
			});
			
			var right_img = document.createElement('img');
			right_img.setAttribute('src', images[1]);
			right_img.setAttribute('class', 'xab_touch');
			right_img.setAttribute('id','right_img');
			$this.append(right_img);
			$("#right_img").click(function() {
				if(!target_left) { correct = true; }
				
				endTime = (new Date()).getTime();
				rt = (endTime-startTime);
				stim1_time = (p2_time-p1_time);
				isi_time = (p3_time-p2_time);
				var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "stim1_time": stim1_time, "isi_time":isi_time}
				block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
				$('.xab_touch').remove();
				setTimeout(function(b){b.next();}, trial.timing[2], block);
			});
			
			//TODO: CHECK IF IMAGE SHOULD DISAPPEAR
			//based on timings
			break;
	}
}