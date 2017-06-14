const root = '../../';

jest.useFakeTimers();

describe('categorize plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-categorize.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['categorize']).not.toBe('undefined');
	});

});
