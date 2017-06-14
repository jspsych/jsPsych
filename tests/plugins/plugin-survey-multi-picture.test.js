const root = '../../';

jest.useFakeTimers();

describe('survey-multi-picture plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-multi-picture.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-picture']).not.toBe('undefined');
	});

});
