/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('form plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-form.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['form']).not.toBe('undefined');
	});

});
