/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

jest.useFakeTimers();

describe('call-function plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-call-function.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['call-function']).not.toBe('undefined');
	});

	// SKIP FOR NOW
	test.skip('calls function', function(){
		var myFunc = function() {
			return 1;
		}

		var trial = {
			type: 'call-function',
			func: myFunc
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe("");
	});

});
