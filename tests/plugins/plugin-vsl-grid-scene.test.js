// const root = '../../';

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-vsl-grid-scene.js';

jest.useFakeTimers();

describe('vsl-grid-scene plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-vsl-grid-scene.js');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['vsl-grid-scene']).not.toBe('undefined');
	});

});
