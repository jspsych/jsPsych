const root = '../../';

jest.useFakeTimers();

describe('text plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-text.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['text']).not.toBe('undefined');
	});

	test('displays text', function(){
		var trial = {
			type: 'text',
			text: 'Hello World!'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('Hello World!');

		document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
		document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

		expect(jsPsych.getDisplayElement().innerHTML).toBe("");
	});

	test('when key in choices is pressed, window should display next trail', function(){
		var trial = {
			type: 'text',
			text: 'Testing',
			choices: ['f']
		};

		var trial2 = {
			type: 'text',
			text: 'Second Trial'
		};

		var timeline = [];
		timeline.push(trial);
		timeline.push(trial2);

		jsPsych.init({
			timeline: timeline
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('Testing');

		document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
		document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('Second Trial');

	});
});
