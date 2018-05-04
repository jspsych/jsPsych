/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('vsl-animate-occlusion plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-vsl-animate-occlusion.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['vsl-animate-occlusion']).not.toBe('undefined');
	});

});
