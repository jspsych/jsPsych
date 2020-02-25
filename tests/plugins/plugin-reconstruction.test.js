// const root = '../../';

import jsPsych from '../../jspsych.js';
import jspsychReconstruction from '../../plugins/jspsych-reconstruction.js';

jest.useFakeTimers();

describe('reconstruction plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-reconstruction.js');
	// });

	test('loads correctly', function(){
		expect(typeof jspsychReconstruction).not.toBe('undefined');
	});

});
