const root = '../../';
const utils = require('../testing-utils.js');

describe('data conversion to json', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-text.js');
  });
  
  test('survey-text data is correctly converted', function(){
    var trial = {
      type: 'survey-text',
      questions: [
        {prompt: 'Q1'},
        {prompt: 'Q2'}
      ]
    }

    var timeline = [trial];

    jsPsych.init({timeline});

    document.querySelector('#input-0').value = 'Response 1';
    document.querySelector('#input-1').value = 'Response 2';

    utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id', 'time_elapsed', 'trial_type']).json();
    expect(json_data).toBe(JSON.stringify([{responses: {Q0: "Response 1", Q1: "Response 2"}, trial_index: 0}]));
  })

});