const root = '../../';

jest.useFakeTimers();

describe('survey-text plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-text.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-text']).not.toBe('undefined');
	});

});
