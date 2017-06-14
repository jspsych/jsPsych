const root = '../../';

jest.useFakeTimers();

describe('palmer plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-palmer.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['palmer']).not.toBe('undefined');
	});

});
