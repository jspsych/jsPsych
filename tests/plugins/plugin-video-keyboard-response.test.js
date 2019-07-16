const root = '../../';

jest.useFakeTimers();

describe('video-keyboard-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-video-keyboard-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['video-keyboard-response']).not.toBe('undefined');
	});

});
