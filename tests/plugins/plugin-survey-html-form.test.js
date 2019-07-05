const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

const TEST_VALUE = 'jsPsych'

describe('survey-html-form plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-html-form.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['survey-html-form']).not.toBe('undefined');
	});

	test('default parameters work correctly', function(){
		var trial = {
			type: 'survey-html-form',
			html: '<p> I am feeling <input name="first" type="text" />, <input name="second" type="text" />, and <input name="third" type="text" />.</p>'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelectorAll('#jspsych-survey-html-form input:not([type="submit"]').length).toBe(3);

		// Provide some test input
		jsPsych.getDisplayElement().querySelectorAll('#jspsych-survey-html-form input[name="second"]')[0].value = TEST_VALUE

		utils.clickTarget(document.querySelector('#jspsych-survey-html-form-next'));

		// Ensure, there are no remaining contents
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');

		// Check whether data is parsed properly
		var data = JSON.parse(jsPsych.data.get().values()[0].responses)
		expect(data.second).toBe(TEST_VALUE)
	});

});
