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
    check_fn: called with display_element as argument when subject attempts to proceed; only proceeds if this
              returns true; (optional)
  cont_key:  this setting is used for all pages that don't define it themself (optional)
  cont_btn: this setting is used for all pages that don't define it themself (optional)
  timing:    this setting is used for all pages that don't define it themself (optional)
  force_refresh: set to true if you want to force the plugin to grab the newest version of the html document
  
Data:
  array of
    url:      the url of the page
    rt: duration the user looked at the page in ms
  

Example Usage:
  jsPsych.init( 
    {experiment_structure: [
		   {type: "html", pages:[{url: "intro.html", cont_btn: "start"}]}
		 ]
	});
*/
(function($) {
    jsPsych.html = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = [];
            for (var i = 0; i < params.pages.length; i++) {
                trials.push({
                    type: "html",
                    url: params.pages[i].url,
                    cont_key: params.pages[i].cont_key || params.cont_key,
                    cont_btn: params.pages[i].cont_btn || params.cont_btn,
                    timing_post_trial: params.pages[i].timing_post_trial || params.timing_post_trial || 1000,
                    check_fn: params.pages[i].check_fn,
                    force_refresh: (typeof params.force_refresh === 'undefined') ? false : params.force_refresh
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            var url = trial.url;
            if (trial.force_refresh) {
                url = trial.url + "?time=" + (new Date().getTime());
            }

            display_element.load(trial.url, function() {
                var t0 = (new Date()).getTime();
                var finish = function() {
                    if (trial.check_fn && !trial.check_fn(display_element)) return;
                    if (trial.cont_key) $(document).unbind('keyup', key_listener);
                    block.writeData({
                        trial_type: "html",
                        trial_index: block.trial_idx,
                        rt: (new Date()).getTime() - t0,
                        url: trial.url
                    });
                    if (trial.timing) {
                        // hide display_element, since it could have a border and we want a blank screen during timing
                        display_element.hide();
                        setTimeout(function() {
                            display_element.empty();
                            display_element.show();
                            block.next();
                        }, trial.timing);
                    }
                    else {
                        display_element.empty();
                        block.next();
                    }
                };
                if (trial.cont_btn) $('#' + trial.cont_btn).click(finish);
                if (trial.cont_key) {
                    var key_listener = function(e) {
                        if (e.which == trial.cont_key) finish();
                    };
                    $(document).keyup(key_listener);
                }
            });
        };

        return plugin;
    })();
})(jQuery);
