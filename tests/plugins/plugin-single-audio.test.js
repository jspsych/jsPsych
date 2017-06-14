const root = '../../';

jest.useFakeTimers();

describe('single-audio plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-single-audio.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['single-audio']).not.toBe('undefined');
	});

});
