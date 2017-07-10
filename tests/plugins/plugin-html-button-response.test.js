const utils = require('../testing-utils.js');
const root = '../../';

jest.useFakeTimers();

describe('html-button-response', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-html-button-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['html-button-response']).not.toBe('undefined');
	});

	test('displays html stimulus', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-stimulus">this is html</div>');
	}); 

	test('display button labels', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice1', 'button-choice2']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\">button-choice1</button>'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\">button-choice2</button>'));
	});

	test('display button html', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['buttonChoice'],
			button_html: '<button class="jspsych-custom-button">%choice%</button>',
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class="jspsych-custom-button">buttonChoice</button>'));
	});

	test('display should clear after button click', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-button-response-stimulus">this is html</div>'));

		utils.clickTarget(document.querySelector('#jspsych-html-button-response-button-0'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('prompt should append below button', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice'],
			prompt: '<p>this is a prompt</p>'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<button class=\"jspsych-btn\">button-choice</button></div></div><p>this is a prompt</p>')
	});

	test('should hide stimulus if stimulus-duration is set', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice'],
			stimulus_duration: 500
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-stimulus').style.visibility).toMatch("");
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-button-response-stimulus').style.visibility).toMatch('hidden');
	});

	test('should end trial when trial duration is reached', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice'],
			trial_duration: 500,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-stimulus">this is html</div>');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should end trial when button is clicked', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice'],
			response_ends_trial: true,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-stimulus">this is html</div>');
		utils.clickTarget(document.querySelector('#jspsych-html-button-response-button-0'));
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('class should have responded when button is clicked', function(){
		var trial = {
			type: 'html-button-response',
			stimulus: 'this is html',
			choices: ['button-choice'],
			response_ends_trial: false,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-button-response-stimulus">this is html</div>');
		utils.clickTarget(document.querySelector('#jspsych-html-button-response-button-0'));
		expect(document.querySelector('#jspsych-html-button-response-stimulus').className).toBe(' responded');
	});
});