/**
 * @jest-environment jsdom
 */

const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('animation plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-animation.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['animation']).not.toBe('undefined');
	});

	// SKIP FOR NOW
	test.skip('displays stimuli', function(){

		var animation_sequence = ['img/face_1.jpg', 'img/face_2.jpg'];

		var trial = {
			type: 'animation',
			stimuli: animation_sequence
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="img/face_1.jpg" id="jspsych-animation-image"></img>');
	});

});
