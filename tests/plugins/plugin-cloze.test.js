const utils = require('../testing-utils.js');
const root = '../../';

jest.useFakeTimers();

describe('cloze', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-cloze');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['cloze']).not.toBe('undefined');
	});

	test('displays cloze', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div class="cloze">This is a <input type="text" id="input0" value=""> text.</div>');
	}); 

	test('displays default button text', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">OK</button>'));
	});

	test('displays custom button text', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
			button_text: 'Next'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">Next</button>'));
	});

	test('ends trial on button click when using default settings, i.e. answers are not checked', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.'
		}

		jsPsych.init({
			timeline: [trial]
		});

		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('ends trial on button click when answers are checked and correct', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
			check_answers: true
		}

		jsPsych.init({
			timeline: [trial]
		});

		document.getElementById('input0').value = 'cloze';
		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('does not end trial on button click when answers are checked and not correct', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
			check_answers: true
		}

		jsPsych.init({
			timeline: [trial]
		});

		document.getElementById('input0').value = 'some wrong answer';
		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		expect(jsPsych.getDisplayElement().innerHTML).not.toBe('');
	});

	test('does not call mistake function on button click when answers are checked and correct', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
			check_answers: true,
			mistake_fn: function(){called = true}
		}

		jsPsych.init({
			timeline: [trial]
		});

		var called = false;
		document.getElementById('input0').value = 'cloze';
		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		expect(called).not.toBeTruthy();
	});

	test('calls mistake function on button click when answers are checked and not correct', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text.',
			check_answers: true,
			mistake_fn: function(){called = true}
		}

		jsPsych.init({
			timeline: [trial]
		});

		var called = false;
		document.getElementById('input0').value = 'some wrong answer';
		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		expect(called).toBeTruthy();
	});

	test('response data is stored as an array', function(){
		var trial = {
			type: 'cloze',
			text: 'This is a %cloze% text. Here is another cloze response box %%.'
		}

		jsPsych.init({
			timeline: [trial]
		});

		document.getElementById('input0').value = 'cloze1';
		document.getElementById('input1').value = 'cloze2';
		utils.clickTarget(document.querySelector('#finish_cloze_button'));
		var data = jsPsych.data.get().values()[0].response;
		expect(data.length).toBe(2);
		expect(data[0]).toBe('cloze1');
		expect(data[1]).toBe('cloze2');
	});
});