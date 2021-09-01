const root = '../../';

jest.useFakeTimers();

describe('image-resize-response plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-image-resize-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['image-resize-response']).not.toBe('undefined');
	});

});
