const root = '../../';

jest.useFakeTimers();

describe('call-function plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-call-function.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['call-function']).not.toBe('undefined');
	});

	test('calls function', function(){
		var myFunc = function() {
			return '<p>I am a function</p>';
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
