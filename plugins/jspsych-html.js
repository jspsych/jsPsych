/** (July 2012, Erik Weitnauer)
The html-plugin will load and display an arbitrary number of html pages. To proceed to the next, the
user might either press a button on the page or a specific key. Afterwards, the page get hidden and
the plugin will wait of a specified time before it proceeds.

documentation: docs.jspsych.org
*/
(function($) {
    jsPsych.html = (function() {

        var plugin = {};

        plugin.create = function(params) {

            params = jsPsych.pluginAPI.enforceArray(params, ['pages']);

            var trials = [];


            for (var i = 0; i < params.pages.length; i++) {
                trials.push({
                    url: params.pages[i].url,
                    cont_key: params.pages[i].cont_key || params.cont_key,
                    cont_btn: params.pages[i].cont_btn || params.cont_btn,
                    check_fn: params.pages[i].check_fn || function(){ return true; },
                    force_refresh: (typeof params.force_refresh === 'undefined') ? false : params.force_refresh
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial, ["check_fn"]);

            var url = trial.url;
            if (trial.force_refresh) {
                url = trial.url + "?time=" + (new Date().getTime());
            }

            display_element.load(trial.url, function() {
                var t0 = (new Date()).getTime();
                var finish = function() {
                    if (trial.check_fn && !trial.check_fn(display_element)) return;
                    if (trial.cont_key) $(document).unbind('keydown', key_listener);
                    jsPsych.data.write({
                        rt: (new Date()).getTime() - t0,
                        url: trial.url
                    });
                    display_element.empty();
                    jsPsych.finishTrial();
                };
                if (trial.cont_btn) $('#' + trial.cont_btn).click(finish);
                if (trial.cont_key) {
                    var key_listener = function(e) {
                        if (e.which == trial.cont_key) finish();
                    };
                    $(document).keydown(key_listener);
                }
            });
        };

        return plugin;
    })();
})(jQuery);
