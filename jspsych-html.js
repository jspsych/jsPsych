/** (July 2012, Erik Weitnauer)
The html-plugin will load and display an arbitrary number of html pages. To proceed to the next, the
user might either press a button on the page or a specific key. Afterwards, the page get hidden and
the plugin will wait of a specified time before it proceeds.

Parameters:
  pages: array of
    url:       url of the html-page to display (mandatory)
    cont_key:  keycode of the key to continue (optional)
    cont_btn:  id of a button (or any element on the page) that can be clicked to continue (optional)
               note that the button / element has to be included in the page that is loaded, already
    timing:   number of ms to wait after hiding the page and before proceeding (optional)
  cont_key:  this setting is used for all pages that don't define it themself (optional)
  cont_btn: this setting is used for all pages that don't define it themself (optional)
  timing:    this setting is used for all pages that don't define it themself (optional)

Data:
  array of
    url:      the url of the page
    timing:   the timing parameter that was given, if any
    user_duration: duration the user looked at the page in ms
  

Example Usage:
  jsPsych.init($('#target'), 
    {experiment_structure: [
		   {type: "html", pages:[{url: "intro.html", cont_btn: "start"}]}
		 ],
		 finish: function(data) { }
	});
*/
(function( $ ) {
	jsPsych.html = (function(){

		var plugin = {};
        
		plugin.create = function(params) {
		  var trials = [];
			for(var i=0; i<params.pages.length; i++) {
			  trials.push(
			    {type: "html"
			    ,url: params.pages[i].url
			    ,cont_key: params.pages[i].cont_key || params.cont_key
			    ,cont_btn: params.pages[i].cont_btn || params.cont_btn
			    ,timing: params.pages[i].timing || params.timing
			    }
			  );
			}
			return trials;
		}

		plugin.trial = function($this, block, trial, part) {
		  $this.load(trial.url, function() {
		    var t0 = Date.now();
		    var finish = function() {
		      block.data[block.trial_idx] = 
 		      { user_duration: Date.now()-t0
		       ,url: trial.url
		      };
		      if (trial.timing) {
		        block.data[block.trial_idx].timing = trial.timing;
		        // hide $this, since it could have a border and we want a blank screen during timing
		        $this.hide(); 
		        setTimeout(function() {
		          $this.empty();
		          $this.show();
		          block.next();
		        }, trial.timing);
		      } else {
		        $this.empty();
		        block.next();
		      }
		    }
		    if (trial.cont_btn) $('#'+trial.cont_btn).click(finish);
		    if (trial.cont_key) {
  		    var key_listener = function(e) {
	  	      if (e.which == trial.cont_key) {
	  	        $(document).unbind('keyup', key_listener);
	  	        finish();
	  	      }
	  	    }
	  	    $(document).keyup(key_listener);
	  		}
	    });
		}
    
		return plugin;
	})();
}) (jQuery);
