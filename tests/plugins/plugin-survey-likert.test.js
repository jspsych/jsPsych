const root = '../../';

jest.useFakeTimers();

describe('survey-likert plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-likert.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-likert']).not.toBe('undefined');
	});

});
