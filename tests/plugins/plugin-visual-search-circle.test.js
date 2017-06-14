const root = '../../';

jest.useFakeTimers();

describe('visual-search-circle plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-visual-search-circle.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['visual-search-circle']).not.toBe('undefined');
	});

});
