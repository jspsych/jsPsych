const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('case_sensitive_responses parameter', function(){
  test('has a default value of false', function(){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo',
      choices: ['a']
    };

    jsPsych.init({timeline: [t]});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('A');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('');
  });

  test('responses are not case sensitive when set to false', function(){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo',
      choices: ['a']
    };

    jsPsych.init({timeline: [t], case_sensitive_responses: false});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('A');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('');
  });

  test('responses are case sensitive when set to true', function(){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo',
      choices: ['a']
    };
  
    jsPsych.init({timeline: [t], case_sensitive_responses: true});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('A');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('');
  });
});