const root = '../../';

jest.useFakeTimers();

describe('iat plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-button-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['button-response']).not.toBe('undefined');
	});

});