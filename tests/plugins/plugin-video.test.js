const root = '../../';

jest.useFakeTimers();

describe('video plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-video.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['video']).not.toBe('undefined');
	});

});
