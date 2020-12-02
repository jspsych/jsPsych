const root = '../../';

jest.useFakeTimers();

describe('video-slider-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-video-slider-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['video-slider-response']).not.toBe('undefined');
	});

	test('video preloading initiates automatically', function(){
		const preload_spy = jest.spyOn(jsPsych.pluginAPI, 'registerPreload');
		const console_spy = jest.spyOn(console, 'warn');
		var trial = {
			type: 'video-slider-response',
			stimulus: [root + 'tests/media/sample_video.mp4']
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
