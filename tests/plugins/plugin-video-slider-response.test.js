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

});
