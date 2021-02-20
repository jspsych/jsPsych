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

	test('keys can be specified as strings', function(){
		var trial = {
			type: 'instructions',
			pages: ['page 1', 'page 2'],
			key_forward: 'a'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 1');

		utils.pressKey('a');

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey('a');

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

	test('bug issue #544 reproduce', function(){
		var trial = {
			type: 'instructions',
			pages: ['page 1', 'page 2'],
			key_forward: 'a',
			allow_backward: false
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 1');

		utils.pressKey('a');

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey('ArrowLeft');

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');

		utils.pressKey('a');

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	})

	test('view history data is stored as array of objects', function(){
		var trial = {
			type: 'instructions',
			pages: ['page 1', 'page 2'],
			key_forward: 'a'
		}

		jsPsych.init({
			timeline: [trial]
		});

		utils.pressKey('a');
		utils.pressKey('a');
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
		var data = jsPsych.data.get().values()[0].view_history;
		expect(data[0].page_index).toBe(0);
		expect(data[1].page_index).toBe(1);
	})

});
