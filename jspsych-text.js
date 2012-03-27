function text_create(params)
{
	var trials = new Array(params.text.length);
	for(var i = 0; i < trials.length; i++)
	{
		trials[i] = {};
		trials[i]["type"] = "text";
		trials[i]["text"] = params.text[i];
		trials[i]["timing"] = params.timing;
	}
	return trials;
}

function text_trial($this, block, trial, part)
{
	$this.html(trial.text);
	var key_listener = function(e) {
		if(e.which=="80") // 'spacebar' 
		{
			flag = true;				
			$(document).unbind('keyup',key_listener);
			$this.html('');
			setTimeout(function(b){b.next();}, trial.timing[0], block);
		}
	}
	$(document).keyup(key_listener);
}