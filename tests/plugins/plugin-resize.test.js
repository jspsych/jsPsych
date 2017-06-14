const root = '../../';

jest.useFakeTimers();

describe('resize plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-resize.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['resize']).not.toBe('undefined');
	});

});
