const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('categorize-html plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-categorize-html.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['categorize-html']).not.toBe('undefined');
	});

});
