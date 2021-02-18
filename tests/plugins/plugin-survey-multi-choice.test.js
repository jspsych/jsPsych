const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('survey-multi-choice plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-multi-choice.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-multi-choice']).not.toBe('undefined');
	});

	test('data are logged with the right question when randomize order is true', function(){
		var scale = ['a','b','c','d','e'];
		var t = {
			type: 'survey-multi-choice',
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

		document.querySelector('#jspsych-survey-multi-choice-0 input[value="a"]').checked = true;
		document.querySelector('#jspsych-survey-multi-choice-1 input[value="b"]').checked = true;
		document.querySelector('#jspsych-survey-multi-choice-2 input[value="c"]').checked = true;
		document.querySelector('#jspsych-survey-multi-choice-3 input[value="d"]').checked = true;
		document.querySelector('#jspsych-survey-multi-choice-4 input[value="e"]').checked = true;

		utils.clickTarget(document.querySelector('#jspsych-survey-multi-choice-next'));

		var survey_data = jsPsych.data.get().values()[0].response;
		expect(survey_data.Q0).toBe('a');
		expect(survey_data.Q1).toBe('b');
		expect(survey_data.Q2).toBe('c');
		expect(survey_data.Q3).toBe('d');
		expect(survey_data.Q4).toBe('e');
	});
});
