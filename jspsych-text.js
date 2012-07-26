
(function( $ ) {
	jsPsych.text = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			var trials = new Array(params.text.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "text";
				trials[i]["text"] = params.text[i];
				trials[i]["cont_key"] = params.cont_key;
				trials[i]["timing"] = params.timing;
				if(params.variables != undefined)
				{
					trials[i]["variables"] = params.variables[i];
				}
			}
			return trials;
		}
		
		plugin.trial = function($this, block, trial, part) {
			var replaced_text = trial.text;
			
			if(trial.variables != undefined)
			{
				for(var i = 0; i < trial.variables.length; i++)
				{
					var variable_text = trial.variables[i](); // variables are defined as functions
					replaced_text = replaced_text.replace("%v", variable_text);
				}
			}
		
			$this.html(replaced_text);
			var key_listener = function(e) {
				if(e.which==trial.cont_key) 
				{
					flag = true;				
					$(document).unbind('keyup',key_listener);
					$this.html('');
					setTimeout(function(){block.next();}, trial.timing[0]);
				}
			}
			$(document).keyup(key_listener);
		}
		
		return plugin;
	})();
}) (jQuery);