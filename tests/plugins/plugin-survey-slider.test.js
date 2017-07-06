const root = '../../';

jest.useFakeTimers();

describe('survey-slider plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-slider.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-slider']).not.toBe('undefined');
	});

});
