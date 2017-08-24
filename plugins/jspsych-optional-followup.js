jsPsych.plugins['conditional-run'] = (function () {
	var plugin = {};

	plugin.info = {
		name: 'conditional-run',
		description: 'Only run the specified plugin if a condition is met',
		parameters: {
			'dependentPluginParameters': {
				type: jsPsych.plugins.parameterType.COMPLEX,
				description: 'The parameters to pass to the plugin that will be run, including the type of plugin',
				nested: {
					'type': {
						type: jsPsych.plugins.parameterType.STRING,
						description: 'The type of the plugin to use if the condition is met'
					}
					// + Other parameters relevant to the dependent plugin
				}
			},
			'conditionalFunction': {
				type: jsPsych.plugins.parameterType.FUNCTION,
				description: 'Function that will be executed when this trial is started. If it returns true, the trial is run. Otherwise, it is skipped.'
			}
		}
	}
	plugin.trial = function (display_element, trial) {
		if (typeof trial.conditionalFunction === 'function' && trial.conditionalFunction()) {
			// protect functions in the parameters (only does a shallow copy)
			var dependentPluginParams = Object.assign({}, trial.dependentPluginParameters);
			jsPsych.plugins[dependentPluginParams.type].trial(display_element, dependentPluginParams);
		} else {
			// skip
			jsPsych.finishTrial();
		}
	}
	return plugin;
})();