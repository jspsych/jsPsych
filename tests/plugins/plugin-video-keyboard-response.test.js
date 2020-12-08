const root = '../../';

jest.useFakeTimers();

describe('video-keyboard-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		// don't load plugin here - need to spy on registerPreload before its called
	});

	test('loads correctly', function(){
		require(root + 'plugins/jspsych-video-keyboard-response.js');
		expect(typeof window.jsPsych.plugins['video-keyboard-response']).not.toBe('undefined');
	});

	test('video preloading initiates automatically', function(){
		const preload_spy = jest.spyOn(jsPsych.pluginAPI, 'registerPreload');
		const console_spy = jest.spyOn(console, 'warn');
		require(root + 'plugins/jspsych-video-keyboard-response.js');
		var trial = {
			type: 'video-keyboard-response',
			stimulus: [root + 'tests/media/sample_video.mp4'],
			choices: jsPsych.ALL_KEYS
		}
		jsPsych.init({
			timeline: [trial]
		});
		expect(preload_spy).toHaveBeenCalled(); 
		expect(console_spy).not.toHaveBeenCalledWith('jsPsych failed to auto preload one or more files:');
		preload_spy.mockRestore();
		console_spy.mockRestore();
	});

});
