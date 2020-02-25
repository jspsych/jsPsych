// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import categorizeHtml from '../../plugins/jspsych-categorize-html.js';

jest.useFakeTimers();

describe('categorize-html plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-categorize-html.js');
	// });

	test('loads correctly', function(){
		expect(typeof categorizeHtml).not.toBe('undefined');
	});

});
