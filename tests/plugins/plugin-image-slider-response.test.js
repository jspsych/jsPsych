const utils = require('../testing-utils.js');
const root = '../../';

jest.useFakeTimers();

describe('image-slider-response', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-image-slider-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['image-slider-response']).not.toBe('undefined');
	});

	test('displays image stimulus', function(){
		var trial = {
			type: 'image-slider-response',
			stimulus: '../media/blue.png',
			labels: ['left', 'right'],
		}

		jsPsych.init({
			timeline: [trial],
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"></div>');
	});
});