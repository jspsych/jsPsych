const root = '../../';

jest.useFakeTimers();

describe('animation plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-animation.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['animation']).not.toBe('undefined');
	});

});
