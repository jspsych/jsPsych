// const root = '../../';

import jsPsych from '../../jspsych.js';
import videoButtonResponse from '../../plugins/jspsych-video-button-response.js';

jest.useFakeTimers();

describe('video-button-response plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-video-button-response.js');
	// });

	test('loads correctly', function(){
		expect(typeof videoButtonResponse).not.toBe('undefined');
	});

});
