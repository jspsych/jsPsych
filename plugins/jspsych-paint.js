(function( $ ) {
	jsPsych.paint = (function(){
	
		var plugin = {};
	
		// private functions
		function colorPixel(ctx, x, y, fresh)
		{
			ctx.globalCompositeOperation = "destination-out";
			ctx.fillStyle = "rgba(0,0,0, 1.0)";
			//ctx.fillRect(x,y,10,10);
			//ctx.arc(x,y,10,0,Math.Pi*2,true);
			//ctx.fill();
			
			ctx.lineWidth = 30;
			ctx.lineCap = ctx.lineJoin = 'round';
			ctx.strokeStyle = "rgba(0,0,0,1.0)";
			
			if(fresh){
				ctx.beginPath();
				ctx.moveTo(x+0.01,y);
			}
			ctx.lineTo(x,y);
			ctx.stroke();
		}
	
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "paint";
				trials[i]["a_path"] = stims[i];
				trials[i]["height"] = params["height"];
				trials[i]["width"] = params["width"];
				trials[i]["timing"] = params["timing"];
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
				if(params["prompt"]!=undefined){
					trials[i]["prompt"] = params["prompt"];
				}
			}
			return trials;
		}

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					p1_time = (new Date()).getTime();
					
					display_element.append($('<div>', {
						"id": 'paintbox',
						"class": 'paint'}));
					
					$('#paintbox').css({
						'position': 'relative',
						'width': trial.width,
						'height': trial.height});
					
					$('#paintbox').append($('<img>', {
						"src": trial.a_path,
						"class": 'paint',
						"css": {
							'width':trial.width,
							'height':trial.height,
							'position': 'absolute',
							'top': '0',
							'left': '0',
							'z-index': '0'
						}
					}));
					
					$('#paintbox').append($('<canvas>', {
						"id": "paintcanvas",
						"class": "paint",
						"css": {
							'position': 'absolute',
							'top': '0',
							'left': '0',
							'z-index': '1',
							'cursor': 'crosshair'
						}
					}));
					
					$('#paintcanvas').attr('width',trial.width);
					$('#paintcanvas').attr('height',trial.height);
					
					
					var canvas = document.getElementById('paintcanvas');
					var ctx = canvas.getContext('2d');
					
					ctx.fillStyle = "rgba(0,0,0,0.8)";
					ctx.fillRect(0,0,trial.width,trial.height);
					
					var paint = false;
					
					document.onselectstart = function(){
						return false;
					}
					
					$('#paintcanvas').mousedown(function(e){
						var mouseX = e.pageX - $('#paintbox').offset().left;
						var mouseY = e.pageY - $('#paintbox').offset().top;
						
						paint = true;
						
						colorPixel(ctx, mouseX, mouseY, true);
					});
					
					$('#paintcanvas').mousemove(function(e){
						var mouseX = e.pageX - $('#paintbox').offset().left;
						var mouseY = e.pageY - $('#paintbox').offset().top;
						
						if(paint){
							colorPixel(ctx, mouseX, mouseY, false);
						}
					});
					
					$(document).mouseup(function(e){
						paint = false;
					});
					
					display_element.append($('<button>',{
						'id':'done',
						'class':'paint'}));
					
					$('#done').html('Done');
					$('#done').click(function(){
						plugin.trial(display_element,block,trial,part+1);
					});
					
					display_element.append($('<button>',{
						'id':'reset',
						'class':'paint'}));
						
					$('#reset').html('Reset');
					$('#reset').click(function(){
						ctx.clearRect(0,0,trial.width,trial.height);
						ctx.globalCompositeOperation = "source-over";
						ctx.fillStyle = "rgba(0,0,0,0.8)";
						ctx.fillRect(0,0,trial.width,trial.height);
					});
					
					if(trial.prompt){
						display_element.append(trial.prompt);						
					}
					
					break;
				case 2:
					var canvas = document.getElementById('paintcanvas');
					var ctx = canvas.getContext('2d');
				
					var img = ctx.getImageData(0,0,trial.width,trial.height);
					var pix = img.data;
						
					var tdata = new Array(trial.width*trial.height);
					var data_string = "";
					//tdata[0] = new Array();
					
					for(var i=0, j=0, n=pix.length; i<n; i+=4, j++)
					{
						tdata[j] = (pix[i+3] == 0)
						if(pix[i+3] == 0)
						{
							data_string = data_string+"1";
						} else {
							data_string = data_string+"0";
						}
					}
				
					block.data[block.trial_idx] = $.extend({},{"a_path": trial.a_path,"pixels": data_string},trial.data);
				
					display_element.html('');
					
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);