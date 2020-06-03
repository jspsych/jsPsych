const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('rdk plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-rdk.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['rdk']).not.toBe('undefined');
	});

});
