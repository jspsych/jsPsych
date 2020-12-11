const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('multiple-slider plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-multiple-slider.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['multiple-slider']).not.toBe('undefined');
	});

	test('data are logged with the right question when randomize order is true', function(){
		var scale = ['a','b','c','d','e'];
		var t = {
			type: 'multiple-slider',
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

		// simulate a response for each slider
		document.querySelector('input[name="Q0"]').value = 0;
		document.querySelector('input[name="Q1"]').value = 1;
		document.querySelector('input[name="Q2"]').value = 2;
		document.querySelector('input[name="Q3"]').value = 3;
		document.querySelector('input[name="Q4"]').value = 4;

		utils.clickTarget(document.querySelector('#jspsych-multiple-slider-next'));

		var survey_data = JSON.parse(jsPsych.data.get().values()[0].responses);
		expect(survey_data.Q0).toBe(0);
		expect(survey_data.Q1).toBe(1);
		expect(survey_data.Q2).toBe(2);
		expect(survey_data.Q3).toBe(3);
		expect(survey_data.Q4).toBe(4);
	});

});
