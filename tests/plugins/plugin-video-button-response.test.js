const root = '../../';

jest.useFakeTimers();

describe('video-button-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-video-button-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['video-button-response']).not.toBe('undefined');
	});

});
