/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('same-different-html plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-same-different-html.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['same-different-html']).not.toBe('undefined');
	});

});
