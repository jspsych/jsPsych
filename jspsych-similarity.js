function similarity_create(params)
{
	sim_stims = params["stimuli"];
	trials = new Array(sim_stims.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "sim";
		trials[i]["a_path"] = sim_stims[i][0];
		trials[i]["b_path"] = sim_stims[i][1];
		trials[i]["timing"] = params["timing"];
	}
	return trials;
}

function similarity_trial($this, block, trial, part)
{
	switch(part){
		case 1:
			images = [trial.a_path, trial.b_path];
			if(Math.floor(Math.random()*2)==0){
				images = [trial.b_path, trial.a_path];
			}
			$.fn.jsPsych.showImages($this, images, 'sim');
			// slider
			var slide = document.createElement('div');
			slide.setAttribute('id','slider');
			slide.setAttribute('class','sim');
			$this.append(slide);
			$("#slider").slider(
				{
					value:50,
					min:0,
					max:100,
					step:1,
				});
			// button
			var button = document.createElement('button');
			button.setAttribute('id','next');
			button.setAttribute('class','sim');
			$this.append(button);
			$("#next").html('Next');
			$("#next").click(function(){
				similarity_trial($this,block,trial,part+1);
			});
			break;
		case 2:
			// get data
			var score = $("#slider").slider("value");
			block.data[block.trial_idx] = {"score": score, "a_path": trial.a_path, "b_path": trial.b_path}
			// goto next trial in block
			$(".sim").remove();
			setTimeout(function(b){b.next();}, trial.timing[0], block);
			break;
	}
}