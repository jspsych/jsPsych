const root = '../../';

jest.useFakeTimers();

describe('slider-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-slider-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['slider-response']).not.toBe('undefined');
	});

});
