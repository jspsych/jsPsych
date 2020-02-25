// const root = '../../';

import jsPsych from '../../jspsych.js';
import audioButtonResponse from '../../plugins/jspsych-audio-button-response.js';

jest.useFakeTimers();

describe('audio-button-response', function(){
	
	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-audio-button-response');
	// });

	test('loads correctly', function(){
		expect(typeof audioButtonResponse).not.toBe('undefined');
	});
});