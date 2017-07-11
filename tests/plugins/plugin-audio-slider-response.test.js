const root = '../../';

jest.useFakeTimers();

describe('audio-slider-response', function(){
	
	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-audio-slider-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-slider-response']).not.toBe('undefined');
	});
});