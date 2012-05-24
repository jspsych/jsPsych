(function( $ ) {
	jsPsych.similarity = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			sim_stims = params["stimuli"];
			trials = new Array(sim_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "similarity";
				trials[i]["a_path"] = sim_stims[i][0];
				trials[i]["b_path"] = sim_stims[i][1];
				trials[i]["timing"] = params["timing"];
			}
			return trials;
		}

		plugin.trial = function($this, block, trial, part)
		{
			switch(part){
				case 1:
					images = [trial.a_path, trial.b_path];
					if(Math.floor(Math.random()*2)==0){
						images = [trial.b_path, trial.a_path];
					}
					// show the images
					$this.append($('<img>', {
						"src": images[0],
						"class": 'sim'
					}));
					$this.append($('<img>', {
						"src": images[1],
						"class": 'sim'
					}));

					// create slider
					$this.append($('<div>', { "id": 'slider', "class": 'sim' }));
					$("#slider").slider(
						{
							value:50,
							min:0,
							max:100,
							step:1,
						});
						
					//  create button
					$this.append($('<button>', {'id':'next','class':'sim'}));
					$("#next").html('Next');
					$("#next").click(function(){
						plugin.trial($this,block,trial,part+1);
					});
					break;
				case 2:
					// get data
					var score = $("#slider").slider("value");
					block.data[block.trial_idx] = {"score": score, "a_path": trial.a_path, "b_path": trial.b_path}
					// goto next trial in block
					$('.sim').remove();
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);