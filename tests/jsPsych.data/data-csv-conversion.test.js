const root = '../../';
const utils = require('../testing-utils.js');

describe('data conversion to csv', function(){

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

    var csv_data = jsPsych.data.get().ignore(['rt','internal_node_id', 'time_elapsed', 'trial_type']).csv();
    expect(csv_data).toBe('"responses","trial_index"\r\n"{""Q0"":""Response 1"",""Q1"":""Response 2""}","0"\r\n');
  })

});