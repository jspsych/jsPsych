// jsPsych plugin for showing animations
// Josh de Leeuw

(function( $ ) {
	jsPsych.animation = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "animation";
				trials[i]["stims"] = stims[i];
				trials[i]["frame_time"] = params["frame_time"];
				trials[i]["repetitions"] = params["repetitions"] || 1;
				trials[i]["timing"] = params["timing"];
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"][i];
				}
			}
			return trials;
		}

		plugin.trial = function($this, block, trial, part)
		{
			var animate_frame = -1;
			var reps = 0;
			switch(part)
			{
				case 1:
					animate_interval = setInterval(function(){
						showImage = true;
						$this.html(""); // clear everything
						animate_frame++;
						if(animate_frame == trial.stims.length)
						{
							animate_frame = 0;
							reps++;
							if(reps >= trial.repetitions)
							{
								plugin.trial($this, block, trial, part + 1);
								clearInterval(animate_interval);
								showImage = false;
							}
						}
						if(showImage){
							$this.append($('<img>', {
								"src": trial.stims[animate_frame],
								"class": 'animate'
							}));
							if(trial.prompt != undefined) { $this.append(trial.prompt); }
						}
					}, trial.frame_time);
					break;
				case 2:
					setTimeout(function(){ block.next(); }, trial.timing[0]);
					break;
			}			
		}
		
		return plugin;
	})();
})(jQuery);