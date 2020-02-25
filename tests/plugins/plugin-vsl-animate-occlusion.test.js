// const root = '../../';

import jsPsych from '../../jspsych.js';
import vslAnimateOcclusion from '../../plugins/jspsych-vsl-animate-occlusion.js';

jest.useFakeTimers();

describe('vsl-animate-occlusion plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-vsl-animate-occlusion.js');
	// });

	test('loads correctly', function(){
		expect(typeof vslAnimateOcclusion).not.toBe('undefined');
	});

});
