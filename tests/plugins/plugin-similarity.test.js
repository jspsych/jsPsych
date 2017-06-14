const root = '../../';

jest.useFakeTimers();

describe('similarity plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-similarity.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['similarity']).not.toBe('undefined');
	});

});
