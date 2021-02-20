const utils = require('../testing-utils.js');
const root = '../../';

jest.useFakeTimers();

describe('image-button-response', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-image-button-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['image-button-response']).not.toBe('undefined');
	});

	test('displays image stimulus', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="../media/blue.png"');
	});

	test('display button labels', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice1', 'button-choice2'],
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\">button-choice1</button>'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class=\"jspsych-btn\">button-choice2</button>'));
	});

	test('display button html', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['buttonChoice'],
			button_html: '<button class="jspsych-custom-button">%choice%</button>',
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class="jspsych-custom-button">buttonChoice</button>'));
	});

	test('display should clear after button click', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"');

		utils.clickTarget(document.querySelector('#jspsych-image-button-response-button-0'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('prompt should append below button', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			prompt: '<p>This is a prompt</p>',
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<button class=\"jspsych-btn\">button-choice</button></div></div><p>This is a prompt</p>');
	});

	test('should hide stimulus if stimulus-duration is set', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			stimulus_duration: 500,
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-image-button-response-stimulus').style.visibility).toMatch("");
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-image-button-response-stimulus').style.visibility).toMatch('hidden');
	});

	test('should end trial when trial duration is reached', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['f','j'],
			trial_duration: 500,
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should end trial when button is clicked', function(){
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			response_ends_trial: true,
			render_on_canvas: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"');

		utils.clickTarget(document.querySelector('#jspsych-image-button-response-button-0'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should show console warning when trial duration is null and response ends trial is false', function() {
		const spy = jest.spyOn(console, 'warn').mockImplementation();
		
		var trial = {
			type: 'image-button-response',
			stimulus: '../media/blue.png',
			choices: ['button-choice'],
			response_ends_trial: false,
			trial_duration: null,
			render_on_canvas: false
		};

		jsPsych.init({
			timeline: [trial]
		});

		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});
