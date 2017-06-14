const root = '../../';

jest.useFakeTimers();

describe('vsl-grid-scene plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-vsl-grid-scene.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['vsl-grid-scene']).not.toBe('undefined');
	});

});
