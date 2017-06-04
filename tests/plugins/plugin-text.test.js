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
	});

	test('display should clear when continue key is pressed', function(){
		var trial = {
			type: 'text',
			text: 'Testing',
			cont_key: ['f']
		};

		var trial2 = {
			type: 'text',
			text: 'Second trial'
		};

		var timeline = [];
		timeline.push(trial);
		timeline.push(trial2);

		jsPsych.init({
			timeline: timeline
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('Testing');

		document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
		document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

		expect(jsPsych.getDisplayElement().innerHTML).toBe("");

	});
});