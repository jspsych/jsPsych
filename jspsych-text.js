function text_create(params)
{
	var trials = new Array(params.text.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "text";
		trials[i]["text"] = params.text[i];
		trials[i]["cont_key"] = params.cont_key;
		trials[i]["timing"] = params.timing;
	}
	return trials;
}

function text_trial($this, block, trial, part)
{
	$this.html(trial.text);
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