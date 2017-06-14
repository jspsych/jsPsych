const root = '../../';

jest.useFakeTimers();

describe('html plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-html.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['html']).not.toBe('undefined');
	});

});
