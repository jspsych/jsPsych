const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('maxdiff plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-maxdiff.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['maxdiff']).not.toBe('undefined');
	});

	test('returns appropriate response with randomization', function(){
		var trial = {
			type: 'maxdiff',
			alternatives: ['a', 'b', 'c', 'd'],
			labels: ['Most', 'Least'],
			randomize_alternative_order: true
		}

		jsPsych.init({
			timeline: [trial]
		});

		document.querySelector('input[data-name="0"][name="left"]').checked = true;
		document.querySelector('input[data-name="1"][name="right"]').checked = true;

		utils.clickTarget(document.querySelector('#jspsych-maxdiff-next'));

		var maxdiff_data = jsPsych.data.get().values()[0];
		expect(maxdiff_data.response.left).toBe("a");
		expect(maxdiff_data.response.right).toBe("b");
	});

});
