/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('categorize-image plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-categorize-image.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['categorize-image']).not.toBe('undefined');
	});

});
