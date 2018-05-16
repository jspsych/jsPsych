/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('survey-multi-select plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-survey-multi-select.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-select']).not.toBe('undefined');
	});

	test('quoted values for options work', function(){
		var trial = {
			type: 'survey-multi-select',
			questions: [{
				prompt: 'foo',
				options: ['Hello "boo"', "yes, 'bar'"]
			}]
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-survey-multi-select-option-0-0 input').value).toBe('Hello "boo"');
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-survey-multi-select-option-0-1 input').value).toBe("yes, 'bar'");

		jsPsych.getDisplayElement().querySelector('#jspsych-survey-multi-select-form').dispatchEvent(new Event('submit'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');


	})

});
