/**
 * @jest-environment jsdom
 */
const root = '../../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('vsl-grid-scene plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-vsl-grid-scene.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['vsl-grid-scene']).not.toBe('undefined');
	});

});
