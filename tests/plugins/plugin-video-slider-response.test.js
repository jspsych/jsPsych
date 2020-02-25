// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-video-slider-response.js';

jest.useFakeTimers();

describe('video-slider-response plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-video-slider-response.js');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['video-slider-response']).not.toBe('undefined');
	});

});
