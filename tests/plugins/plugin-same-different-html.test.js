// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-same-different-html.js';

jest.useFakeTimers();

describe('same-different-html plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-same-different-html.js');
	// });

	test('loads correctly', function(){
		expect(typeof jsPsych.plugins['same-different-html']).not.toBe('undefined');
	});

});
