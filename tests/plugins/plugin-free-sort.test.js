const root = '../../';

jest.useFakeTimers();

describe('free-sort plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-free-sort.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['free-sort']).not.toBe('undefined');
	});

});
