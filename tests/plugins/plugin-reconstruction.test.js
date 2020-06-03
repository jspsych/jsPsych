const root = '../../';

jest.useFakeTimers();

describe('reconstruction plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-reconstruction.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['reconstruction']).not.toBe('undefined');
	});

});
