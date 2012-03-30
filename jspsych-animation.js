// jsPsych plugin for showing animations
// Josh de Leeuw
//
// dependency: jquery.canimate.js

function animation_create(params)
{
	stims = params["stimuli"];
	trials = new Array(stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "animate";
		//img_path needs to be of the form:
		//   "path/PREFIX####.EXT
		//substituting whatever values you want for PREFIX and EXT
		//and putting the correct path information
		//PREFIX needs to match the img_prefix param.
		trials[i]["img_path"] = stims[i];
		trials[i]["img_prefix"] = params["prefix"];
		trials[i]["fps"] = params["fps"];
		// frames is how many images are in the animation
		trials[i]["frames"] = params["frames"];
		trials[i]["loop"] = params["loop"];
		trials[i]["timing"] = params["timing"];
	}
	return trials;
}

function animation_trial($this, block, trial, part)
{
	var base_img = document.createElement('img');
	base_img.setAttribute('src',trial.img_path);
	base_img.setAttribute('id','animate');
	$this.append(base_img);
	// using the cAnimate jQuery plugin
	$('#animate').canimate({
		totalFrames: trial.frames,
		imagePrefix: trial.img_prefix,
		fps: trial.fps,
		preload:true,
		loop: trials.loop
	});
		
	setTimeout(function(b){$('#animate').remove(); b.next();}, trial.timing[0], block);
			
}