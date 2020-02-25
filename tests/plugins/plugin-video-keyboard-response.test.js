// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-video-keyboard-response.js';

jest.useFakeTimers();

describe('video-keyboard-response plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-video-keyboard-response.js');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['video-keyboard-response']).not.toBe('undefined');
	});

});
