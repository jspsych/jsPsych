const root = '../../';

jest.useFakeTimers();

describe('call-function plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-call-function.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['call-function']).not.toBe('undefined');
	});

});
