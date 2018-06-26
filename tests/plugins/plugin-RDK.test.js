const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('RDK plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-RDK.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['RDK']).not.toBe('undefined');
	});

});
