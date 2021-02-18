const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('html-keyboard-response', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-html-keyboard-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['html-keyboard-response']).not.toBe('undefined');
	});

	test('displays html stimulus', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');

		utils.pressKey('a');
	});

	test('display clears after key press', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f', 'j']
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'));

		utils.pressKey('f');

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('prompt should append html below stimulus', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f', 'j'],
			prompt: '<div id="foo">this is a prompt</div>'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div><div id="foo">this is a prompt</div>'));

		utils.pressKey('f');
	});

	test('should hide stimulus if stimulus-duration is set', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f','j'],
			stimulus_duration: 500,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility).toMatch("");
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility).toMatch("hidden");
		utils.pressKey('f');
	});

	test('should end trial when trial duration is reached', function(){
		var trial ={
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f', 'j'],
			trial_duration: 500,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('should end trial when key press', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f', 'j'],
			response_ends_trial: true,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'));

		utils.pressKey('f');

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('class should say responded when key is pressed', function(){
		var trial = {
			type: 'html-keyboard-response',
			stimulus: 'this is html',
			choices: ['f','j'],
			response_ends_trial: false,
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'));

		utils.pressKey('f');

		expect(document.querySelector('#jspsych-html-keyboard-response-stimulus').className).toBe(' responded');
	});
});
