/**
 * @jest-environment jsdom
 */

const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('audio-keyboard-response', function(){
	
	beforeEach(function(){
		require(root + 'plugins/jspsych-audio-keyboard-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-keyboard-response']).not.toBe('undefined');
	});
});