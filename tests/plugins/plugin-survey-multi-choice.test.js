const root = '../../';

jest.useFakeTimers();

describe('survey-multi-choice plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-multi-choice.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-choice']).not.toBe('undefined');
	});

});
