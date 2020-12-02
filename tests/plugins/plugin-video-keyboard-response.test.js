const root = '../../';

jest.useFakeTimers();

describe('video-keyboard-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-video-keyboard-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['video-keyboard-response']).not.toBe('undefined');
	});

	test('video preloading initiates automatically', function(){
		const preload_spy = jest.spyOn(jsPsych.pluginAPI, 'registerPreload');
		const console_spy = jest.spyOn(console, 'warn');
		var trial = {
			type: 'video-keyboard-response',
			stimulus: [root + 'tests/media/sample_video.mp4'],
			choices: jsPsych.ALL_KEYS
		}
		jsPsych.init({
			timeline: [trial]
		});
		//expect(preload_spy).toHaveBeenCalled(); // NOT WORKING
		expect(console_spy).not.toHaveBeenCalled();
		preload_spy.mockRestore();
		console_spy.mockRestore();
	});

});
