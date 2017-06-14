const root = '../../';

jest.useFakeTimers();

describe('categorize-animation plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-categorize-animation.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['categorize-animation']).not.toBe('undefined');
	});

});
