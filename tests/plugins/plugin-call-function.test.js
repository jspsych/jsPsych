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

		var trial = {
			type: 'call-function',
			func: function(){
				return 1;
			}
		}

		jsPsych.init({
			timeline: [trial]
		});
		
		expect(jsPsych.data.get().values()[0].value).toBe(1);
	});

	test('async function works', function(){
		var trial = {
			type: 'call-function',
			async: true,
			func: function(done){
				var data = 10;
				done(10);
			}
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.data.get().values()[0].value).toBe(10);
	})

});
