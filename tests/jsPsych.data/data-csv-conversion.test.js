const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('data conversion to csv', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-survey-text.js');
  });
  
  test('survey-text data response object is correctly converted', function(){
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
    expect(csv_data).toBe('"response","trial_index"\r\n"{""Q0"":""Response 1"",""Q1"":""Response 2""}","0"\r\n');
  })

  test('same-different-html stimulus array is correctly converted', function(){
    require(root + 'plugins/jspsych-same-different-html.js');

    var trial = {
      type: 'same-different-html',
      stimuli: ['<p>Climbing</p>', '<p>Walking</p>'],
      answer: 'different',
      gap_duration: 0,
      first_stim_duration: null
    }

    var timeline = [trial];

    jsPsych.init({timeline: timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<p>Climbing</p>');
    utils.pressKey('q');
    jest.runAllTimers();
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<p>Walking</p>');
    utils.pressKey('q');
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    var csv_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type','rt_stim1','response_stim1']).csv(); 
    expect(csv_data).toBe('"answer","correct","stimulus","response","trial_index"\r\n"different","false","[""<p>Climbing</p>"",""<p>Walking</p>""]","q","0"\r\n')
  })

  test('survey-multi-select response array is correctly converted', function(){
    require(root + 'plugins/jspsych-survey-multi-select.js');

    var trial = {
      type: 'survey-multi-select',
      questions: [
        {prompt: "foo", options: ["fuzz", "bizz", "bar"], name: 'q'}
      ]
    };

    var timeline = [trial];

    jsPsych.init({timeline: timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.clickTarget(document.querySelector('#jspsych-survey-multi-select-response-0-0'));
    utils.clickTarget(document.querySelector('#jspsych-survey-multi-select-response-0-1'));
    utils.clickTarget(document.querySelector('#jspsych-survey-multi-select-next'));
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    var csv_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type','question_order']).csv(); 
    expect(csv_data).toBe('"response","trial_index"\r\n"{""q"":[""fuzz"",""bizz""]}","0"\r\n')
  })

});