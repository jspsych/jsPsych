// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import jspsychRdk from '../../plugins/jspsych-rdk.js';

jest.useFakeTimers();

describe('rdk plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-rdk.js');
	// });

	test('loads correctly', function(){
		expect(typeof jspsychRdk).not.toBe('undefined');
	});

});
