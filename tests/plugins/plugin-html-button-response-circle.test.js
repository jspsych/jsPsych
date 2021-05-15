const utils = require('../testing-utils.js');
const root = '../../';

jest.useFakeTimers();

describe('html-button-response-circle', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-html-button-response-circle');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['html-button-response-circle']).not.toBe('undefined');
	});

	test('display button labels', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice1', 'button-choice2']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\" style=\"padding:10px 10px\"><img src=\"button-choice1\" width=\"100\"></button>'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\" style=\"padding:10px 10px\"><img src=\"button-choice2\" width=\"100\"></button>'));
	});

	test('display button html', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['buttonChoice'],
			button_html: '<button class="jspsych-custom-button">%choice%</button>'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class="jspsych-custom-button">buttonChoice</button>'));
	});
    
	test('display should clear after button click', function(){
		var trial = {
			type: 'html-button-response-circle',
			prompt_html: 'this is html',
			choices: ['button-choice']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-button-response-circle-prompt">this is html</div>'));

		utils.clickTarget(document.querySelector('#jspsych-html-button-response-circle-button-0'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should hide prompt if prompt-duration is set', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice'],
			prompt_html: 'this is html',
			prompt_duration: 500
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-circle-prompt').style.visibility).toMatch("");
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-circle-prompt').style.visibility).toMatch('hidden');
	});
    
	test('should hide prompt if prompt-duration is set', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice'],
			fixation_html: 'this is html',
			fixation_duration: 500
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-circle-fixation').style.visibility).toMatch("");
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-circle-fixation').style.visibility).toMatch('hidden');
	});

	test('should end trial when trial duration is reached', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice'],
			trial_duration: 500,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-circle-prompt">this is html</div>');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should end trial when button is clicked', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice'],
			prompt_html: 'this is html',
			response_ends_trial: true,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-circle-prompt">this is html</div>');
		utils.clickTarget(document.querySelector('#jspsych-html-button-response-circle-button-0'));
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('class should have responded when button is clicked', function(){
		var trial = {
			type: 'html-button-response-circle',
			choices: ['button-choice'],
			prompt_html: 'this is html',
			response_ends_trial: false,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-circle-prompt">this is html</div>');
		utils.clickTarget(document.querySelector('#jspsych-html-button-response-circle-button-0'));
		expect(document.querySelector('#jspsych-html-button-response-circle-prompt').className).toBe(' responded');
	});
});