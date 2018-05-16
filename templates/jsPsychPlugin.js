(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jspsych'], factory);
    } else {
        factory(jsPsych);
    }
}(function(jsPsych) {
	<%= contents %>
}));