const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('Trial parameters in the data', function(){
  test('Can be added by specifying the parameter with a value of true in save_trial_parameters', function(){
    
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      save_trial_parameters: {
        choices: true,
        trial_duration: true
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(32);

    var data = jsPsych.data.get().values()[0];
    expect(data.choices).not.toBeUndefined();
    expect(data.trial_duration).not.toBeUndefined();
  });

  test('Can be removed by specifying the parameter with a value of false in save_trial_parameters', function(){
    
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      save_trial_parameters: {
        stimulus: false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(32);

    var data = jsPsych.data.get().values()[0];
    expect(data.stimulus).toBeUndefined();
  });

  test('For compatibility with data access functions, internal_node_id and trial_index cannot be removed', function(){
    
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      save_trial_parameters: {
        internal_node_id: false,
        trial_index: false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(32);

    var data = jsPsych.data.get().values()[0];
    expect(data.internal_node_id).not.toBeUndefined();
    expect(data.trial_index).not.toBeUndefined();
  })

  test('Invalid parameter names throw a warning in the console', function(){
    
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      save_trial_parameters: {
        foo: true,
        bar: false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(32);

    expect(spy).toHaveBeenCalled();
		spy.mockRestore();
  });
})