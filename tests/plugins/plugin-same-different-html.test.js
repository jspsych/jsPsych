// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import sameDifferentHtml from '../../plugins/jspsych-same-different-html.js';

jest.useFakeTimers();

describe('same-different-html plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-same-different-html.js');
	// });

	test('loads correctly', function(){
		expect(typeof sameDifferentHtml).not.toBe('undefined');
	});

});
