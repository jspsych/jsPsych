/**
 * @jest-environment jsdom
 */

const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('audio-slider-response', function(){
	
	beforeEach(function(){
		require(root + 'plugins/jspsych-audio-slider-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-slider-response']).not.toBe('undefined');
	});
});