const root = '../../';

jest.useFakeTimers();

describe('serial-reaction-time-mouse plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-serial-reaction-time-mouse.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['serial-reaction-time-mouse']).not.toBe('undefined');
	});

});
