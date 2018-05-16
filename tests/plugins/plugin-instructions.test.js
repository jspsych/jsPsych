/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
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

});
