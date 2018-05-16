/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('visual-search-circle plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-visual-search-circle.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['visual-search-circle']).not.toBe('undefined');
	});

});
