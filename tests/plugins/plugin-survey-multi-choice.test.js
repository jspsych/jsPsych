/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('survey-multi-choice plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-survey-multi-choice.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-choice']).not.toBe('undefined');
	});

});
