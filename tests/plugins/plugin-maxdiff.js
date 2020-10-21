const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('maxdiff plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-maxdiff.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['maxdiff']).not.toBe('undefined');
	});

});
