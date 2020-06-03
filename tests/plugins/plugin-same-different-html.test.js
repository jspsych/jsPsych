const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('same-different-html plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-same-different-html.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['same-different-html']).not.toBe('undefined');
	});

});
