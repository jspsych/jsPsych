const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('rdk plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-rdk.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['rdk']).not.toBe('undefined');
	});

	test('choices and frame data are stored as arrays', function(){
		var trial = {
			type: 'rdk',
			number_of_dots: 200,
			RDK_type: 3,
			choices: ['a', 'l'], 
			correct_choice: 'l', 
			coherent_direction: 0
		}

		jsPsych.init({
			timeline: [trial]
		});

		utils.pressKey('l')
		var data = jsPsych.data.get().values()[0];
		expect(Array.isArray(data.choices)).toBe(true);
		expect(data.choices).toStrictEqual(['a', 'l']);
		expect(Array.isArray(data.frame_rate_array)).toBe(true);
	});

	test('responses are scored correctly', function(){
		var trial = {
			type: 'rdk',
			number_of_dots: 200,
			RDK_type: 3,
			choices: ['a', 'l'], 
			correct_choice: 'l', 
			coherent_direction: 0
		}
		jsPsych.init({
			timeline: [trial,trial]
		});

		utils.pressKey('l');
		utils.pressKey('a');

		var data = jsPsych.data.get().values();
		expect(data[0].response).toBe('l');
		expect(data[0].correct).toBe(true);
		expect(data[1].response).toBe('a');
		expect(data[1].correct).toBe(false);
	});

});
