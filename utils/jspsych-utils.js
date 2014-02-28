/* utility package for jsPsych */

(function($) {

    jsPsych.utils = (function() {

        // public methods
        var public_object = {};

        // take the hierarchically arranged jsPsych.data object and turn it into
        // a one-dimensional array where each entry is data from a  single trial
        // append_data is optional and can be items that should be added to all
        // trials, such as a subject identifier
        public_object.flatten_data_object = function(data_object, append_data) {

            append_data = (typeof append_data === undefined) ? {} : append_data;

            var trials = [];

            // loop through data_object
            for (var i = 0; i < data_object.length; i++) {
                for (var j = 0; j < data_object[i].length; j++) {
                    var data = $.extend({}, data_object[i][j], append_data);
                    trials.push(data);
                }
            }

            return trials;
        }

        return public_object;
    })();

})(jQuery);
