// const root = '../../';

import jsPsych from '../../jspsych.js';
import visualSearchCircle from '../../plugins/jspsych-visual-search-circle.js';

jest.useFakeTimers();

describe('visual-search-circle plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-visual-search-circle.js');
	// });

	test('loads correctly', function(){
		expect(typeof visualSearchCircle).not.toBe('undefined');
	});

});
