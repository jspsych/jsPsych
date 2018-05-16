/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('reconstruction plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-reconstruction.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['reconstruction']).not.toBe('undefined');
	});

});
