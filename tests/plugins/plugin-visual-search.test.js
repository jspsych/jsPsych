const root = '../../';

jest.useFakeTimers();

describe('visual-search plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-visual-search.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['visual-search']).not.toBe('undefined');
	});

});
