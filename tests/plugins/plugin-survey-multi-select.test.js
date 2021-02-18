const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('survey-multi-select plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
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


	});

	test('data are logged with the right question when randomize order is true', function(){
		var scale = ['a','b','c','d','e'];
		var t = {
			type: 'survey-multi-select',
			questions: [
				{ prompt: 'Q0', options: scale },
				{ prompt: 'Q1', options: scale },
				{ prompt: 'Q2', options: scale },
				{ prompt: 'Q3', options: scale },
				{ prompt: 'Q4', options: scale }
			],
			randomize_question_order: true
		}
		jsPsych.init({timeline:[t]});

		document.querySelector('#jspsych-survey-multi-select-0 input[value="a"]').checked = true;
		document.querySelector('#jspsych-survey-multi-select-1 input[value="b"]').checked = true;
		document.querySelector('#jspsych-survey-multi-select-2 input[value="c"]').checked = true;
		document.querySelector('#jspsych-survey-multi-select-3 input[value="d"]').checked = true;
		document.querySelector('#jspsych-survey-multi-select-4 input[value="e"]').checked = true;

		utils.clickTarget(document.querySelector('#jspsych-survey-multi-select-next'));

		var survey_data = jsPsych.data.get().values()[0].response;
		expect(survey_data.Q0[0]).toBe('a');
		expect(survey_data.Q1[0]).toBe('b');
		expect(survey_data.Q2[0]).toBe('c');
		expect(survey_data.Q3[0]).toBe('d');
		expect(survey_data.Q4[0]).toBe('e');
	});

});
