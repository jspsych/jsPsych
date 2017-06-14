const root = '../../';

jest.useFakeTimers();

describe('form plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-form.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['form']).not.toBe('undefined');
	});

});
