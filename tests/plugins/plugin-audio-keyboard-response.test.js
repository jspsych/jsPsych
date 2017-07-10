const root = '../../';

jest.useFakeTimers();

describe('audio-keyboard-response', function(){
	
	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-audio-keyboard-response');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['audio-keyboard-response']).not.toBe('undefined');
	});

	test('loads audio stimulus', function(){
		var trial = {
			type: 'audio-keyboard-response',
			stimulus: '../media/blue.png'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"../media/blue.png\" id=\"jspsych-audio-keyboard-response-stimulus\">');
	});

});