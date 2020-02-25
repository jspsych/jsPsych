// const root = '../../';

import jsPsych from '../../jspsych.js';
import audioKeyboardResponse from '../../plugins/jspsych-audio-keyboard-response.js';

jest.useFakeTimers();

describe('audio-keyboard-response', function(){
	
	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-audio-keyboard-response');
	// });

	test('loads correctly', function(){
		expect(typeof audioKeyboardResponse).not.toBe('undefined');
	});
});