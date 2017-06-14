const root = '../../';

jest.useFakeTimers();

describe('serial-reaction-time plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-serial-reaction-time.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['serial-reaction-time']).not.toBe('undefined');
	});

});
