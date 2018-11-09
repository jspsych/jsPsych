const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('survey-text plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-text.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-text']).not.toBe('undefined');
	});

	test('default parameters work correctly', function(){
		var trial = {
			type: 'survey-text',
			questions: [{prompt: "How old are you?"}, {prompt: "Where were you born?"}]
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelectorAll('p.jspsych-survey-text').length).toBe(2);
		expect(jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-0"]').size).toBe(40);
		expect(jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-1"]').size).toBe(40);

		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('specifying only columns works', function(){
		var trial = {
			type: 'survey-text',
			questions: [
				{prompt: "How old are you?", columns: 50},
				{prompt: "Where were you born?", columns: 20}
			]
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelectorAll('p.jspsych-survey-text').length).toBe(2);
		expect(jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-0"]').size).toBe(50);
		expect(jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-1"]').size).toBe(20);

		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	// might be useful: https://github.com/jsdom/jsdom/issues/544
	test.skip('required parameter works', function(){
		var trial = {
			type: 'survey-text',
			questions: [
				{prompt: "How old are you?", columns: 50, required: true},
				{prompt: "Where were you born?", columns: 20}
			]
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelectorAll('p.jspsych-survey-text').length).toBe(2);

		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).not.toBe('');

		document.querySelector('input[name="#jspsych-survey-text-response-0"]').value = "100";

		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

});
