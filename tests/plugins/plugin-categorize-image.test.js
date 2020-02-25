// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import categorizeImage from '../../plugins/jspsych-categorize-image.js';

jest.useFakeTimers();

describe('categorize-image plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-categorize-image.js');
	// });

	test('loads correctly', function(){
		expect(typeof categorizeImage).not.toBe('undefined');
	});

});
