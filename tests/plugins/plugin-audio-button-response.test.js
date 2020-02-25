// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-audio-button-response.js';

jest.useFakeTimers();

describe('audio-button-response', function(){
	
	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-audio-button-response');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['audio-button-response']).not.toBe('undefined');
	});
});