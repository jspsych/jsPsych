const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('data conversion to json', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
  });
  
  test('survey-text data response object is correctly converted', function(){
    require(root + 'plugins/jspsych-survey-text.js');

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
    expect(json_data).toBe(JSON.stringify([{response: {Q0: "Response 1", Q1: "Response 2"}, trial_index: 0}]));
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

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type','rt_stim1','response_stim1']).json(); 
    expect(json_data).toBe(JSON.stringify([{answer: 'different', correct: false, stimulus: ['<p>Climbing</p>','<p>Walking</p>'], response: 'q',  trial_index: 0}]));
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

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type','question_order']).json(); 
    var data_js = [
      {
        response: {
          q: ["fuzz","bizz"], 
        },
        trial_index: 0
      }
    ];
    expect(json_data).toBe(JSON.stringify(data_js));
  })

  test('instructions view_history is correctly converted - issue #670', function(){
    require(root + 'plugins/jspsych-instructions.js');

    var trial = {
      type: 'instructions',
      pages: ['page 1','page 2'],
      key_forward: 'a',
      allow_keys: true
    };

    jsPsych.init({timeline: [trial]});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 1');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('page 2');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed']).json(); 
    var js_data = JSON.parse(json_data);
    expect(Array.isArray(js_data[0].view_history)).toBe(true);
    expect(js_data[0].view_history.length).toBe(2);
    expect(js_data[0].view_history[0].page_index).toBe(0);
    expect(js_data[0].view_history[1].page_index).toBe(1);
  })

});