const root = '../../';

jest.useFakeTimers();

describe('multi-stim-multi-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-multi-stim-multi-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['multi-stim-multi-response']).not.toBe('undefined');
	});

});
