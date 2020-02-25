// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-audio-keyboard-response.js';

jest.useFakeTimers();

describe('audio-keyboard-response', function(){
	
	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-audio-keyboard-response');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['audio-keyboard-response']).not.toBe('undefined');
	});
});