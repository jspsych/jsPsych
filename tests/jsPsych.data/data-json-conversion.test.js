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
    expect(json_data).toBe(JSON.stringify([{responses: {Q0: "Response 1", Q1: "Response 2"}, trial_index: 0}]));
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

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type','rt_stim1','key_press_stim1']).json(); 
    expect(json_data).toBe(JSON.stringify([{answer: 'different', correct: false, stimulus: ['<p>Climbing</p>','<p>Walking</p>'], key_press: 'q',  trial_index: 0}]));
  })

  test('video-button-response stimulus array is correctly converted', function(){
    require(root + 'plugins/jspsych-video-button-response.js');

    var trial = {
      type: 'video-button-response',
      stimulus: ['vid/video.mp4'],
      choices: ['button']
    }

    var timeline = [trial];

    jsPsych.init({timeline: timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('video.mp4');
    utils.clickTarget(document.querySelector('#jspsych-video-button-response-button-0'));
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    var json_data = jsPsych.data.get().ignore(['rt','internal_node_id','time_elapsed','trial_type']).json(); 
    expect(json_data).toBe(JSON.stringify([{stimulus: ['vid/video.mp4'], button_pressed: 0, trial_index: 0}]));
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
        responses: {
          q: ["fuzz","bizz"], 
        },
        trial_index: 0
      }
    ];
    expect(json_data).toBe(JSON.stringify(data_js));
  })

  test('jsPsych json function is the same as JSON.stringify', function(){
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
        responses: {
          q: ["fuzz","bizz"], 
        },
        trial_index: 0
      }
    ];
    expect(json_data).toBe(JSON.stringify(data_js));
  })

});