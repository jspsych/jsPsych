const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('instructions plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-instructions.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['instructions']).not.toBe('undefined');
	});

	test('keys can be specified as numeric codes', function(){
		var trial = {
			type: 'instructions',
			pages: ['page 1', 'page 2'],
			key_forward: 32
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 1');

		utils.pressKey(32);

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey(32);

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('bug issue #544 reproduce', function(){
		var trial = {
			type: 'instructions',
			pages: ['page 1', 'page 2'],
			key_forward: 32,
			allow_backward: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 1');

		utils.pressKey(32);

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey(37); // left arrow

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey(32);

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	})

});
