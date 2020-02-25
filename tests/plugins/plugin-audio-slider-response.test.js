// const root = '../../';

import jsPsych from '../../jspsych.js';
import audioSliderResponse from '../../plugins/jspsych-audio-slider-response.js';

jest.useFakeTimers();

describe('audio-slider-response', function(){
	
	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-audio-slider-response');
	// });

	test('loads correctly', function(){
		expect(typeof audioSliderResponse).not.toBe('undefined');
	});
});