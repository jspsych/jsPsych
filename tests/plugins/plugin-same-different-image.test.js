/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('same-different-image plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-same-different-image.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['same-different-image']).not.toBe('undefined');
	});

});
