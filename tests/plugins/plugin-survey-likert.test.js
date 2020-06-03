const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('survey-likert plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-likert.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-likert']).not.toBe('undefined');
	});

	test('data are logged with the right question when randomize order is true', function(){
		var scale = ['a','b','c','d','e'];
		var t = {
			type: 'survey-likert',
			questions: [
				{ prompt: 'Q0', labels: scale },
				{ prompt: 'Q1', labels: scale },
				{ prompt: 'Q2', labels: scale },
				{ prompt: 'Q3', labels: scale },
				{ prompt: 'Q4', labels: scale }
			],
			randomize_question_order: true
		}
		jsPsych.init({timeline:[t]});

		document.querySelector('input[name="Q0"][value="0"]').checked = true;
		document.querySelector('input[name="Q1"][value="1"]').checked = true;
		document.querySelector('input[name="Q2"][value="2"]').checked = true;
		document.querySelector('input[name="Q3"][value="3"]').checked = true;
		document.querySelector('input[name="Q4"][value="4"]').checked = true;

		utils.clickTarget(document.querySelector('#jspsych-survey-likert-next'));

		var survey_data = JSON.parse(jsPsych.data.get().values()[0].responses);
		expect(survey_data.Q0).toBe(0);
		expect(survey_data.Q1).toBe(1);
		expect(survey_data.Q2).toBe(2);
		expect(survey_data.Q3).toBe(3);
		expect(survey_data.Q4).toBe(4);
	});

});
