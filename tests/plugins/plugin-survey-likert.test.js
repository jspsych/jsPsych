/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('survey-likert plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-survey-likert.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-likert']).not.toBe('undefined');
	});

});
