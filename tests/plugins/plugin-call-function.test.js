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
