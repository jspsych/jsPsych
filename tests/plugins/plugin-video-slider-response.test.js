// const root = '../../';

import jsPsych from '../../jspsych.js';
import videoSliderResponse from '../../plugins/jspsych-video-slider-response.js';

jest.useFakeTimers();

describe('video-slider-response plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-video-slider-response.js');
	// });

	test('loads correctly', function(){
		expect(typeof videoSliderResponse).not.toBe('undefined');
	});

});
