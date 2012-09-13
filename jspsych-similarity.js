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
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}

		plugin.trial = function($this, block, trial, part)
		{
			switch(part){
				case 1:
					// show the images
					$this.append($('<img>', {
						"src": trial.a_path,
						"class": 'sim'
					}));
					
					setTimeout(function(){plugin.trial($this, block, trial, part + 1)}, trial.timing[0]);
					break;
					
				case 2:
				
					$('.sim').remove();
					
					setTimeout(function(){plugin.trial($this, block, trial, part + 1)}, trial.timing[0]);
					break;
				case 3:
				
					$this.append($('<img>', {
						"src": trial.b_path,
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
					
					
					// create labels for slider
					$this.append($('<div>', {"id": 'slider_labels', "class": 'sim'}));
					
					$('#slider_labels').append($('<p class="slider_left sim">Not at all similar</p>'));
					$('#slider_labels').append($('<p class="slider_right sim">Identical</p>'));
						
					//  create button
					$this.append($('<button>', {'id':'next','class':'sim'}));
					$("#next").html('Next');
					$("#next").click(function(){
						plugin.trial($this,block,trial,part+1);
					});
					break;
				case 4:
					// get data
					var score = $("#slider").slider("value");
					block.data[block.trial_idx] = $.extend({},{"score": score, "a_path": trial.a_path, "b_path": trial.b_path},trial.data);
					// goto next trial in block
					$('.sim').remove();
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);