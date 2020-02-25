// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-resize.js';

jest.useFakeTimers();

describe('resize plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-resize.js');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['resize']).not.toBe('undefined');
	});

});
