const root = '../../';

jest.useFakeTimers();

describe('survey-multi-select plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-multi-select.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-select']).not.toBe('undefined');
	});

});
