/**
 * @jest-environment jsdom
 */

const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('audio-button-response', function(){
	
	beforeEach(function(){
		require(root + 'plugins/jspsych-audio-button-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-button-response']).not.toBe('undefined');
	});
});