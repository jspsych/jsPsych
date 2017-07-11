const root = '../../';

jest.useFakeTimers();

describe('audio-button-response', function(){
	
	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-audio-button-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-button-response']).not.toBe('undefined');
	});
});