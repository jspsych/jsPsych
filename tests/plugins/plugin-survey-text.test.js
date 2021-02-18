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

	test('data are logged with the right question when randomize order is true', function(){
		var t = {
			type: 'survey-text',
			questions: [
				{ prompt: 'Q0' },
				{ prompt: 'Q1' },
				{ prompt: 'Q2' },
				{ prompt: 'Q3' },
				{ prompt: 'Q4' }
			],
			randomize_question_order: true
		}
		jsPsych.init({timeline:[t]});

		document.querySelector('#input-0').value = "a0";
		document.querySelector('#input-1').value = "a1";
		document.querySelector('#input-2').value = "a2";
		document.querySelector('#input-3').value = "a3";
		document.querySelector('#input-4').value = "a4";

		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		var survey_data = jsPsych.data.get().values()[0].response;
		expect(survey_data.Q0).toBe('a0');
		expect(survey_data.Q1).toBe('a1');
		expect(survey_data.Q2).toBe('a2');
		expect(survey_data.Q3).toBe('a3');
		expect(survey_data.Q4).toBe('a4');
	});

});
