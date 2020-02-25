const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import htmlKeyboardResponse from '../../plugins/jspsych-html-keyboard-response.js';

jest.useFakeTimers();

// const root = '../../';
// beforeEach(function(){
//   require(root + 'jspsych.js');
//   require(root + 'plugins/jspsych-html-keyboard-response.js');
// });

describe('default iti parameter', function(){
  test('has a default value of 0', function(){
    var t = {
      type: htmlKeyboardResponse,
      stimulus: 'foo'
    }

    var t2 = {
      type: htmlKeyboardResponse,
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2]});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey(32);
  });

  test('creates a correct delay when set', function(){
    var t = {
      type: htmlKeyboardResponse,
      stimulus: 'foo'
    }

    var t2 = {
      type: htmlKeyboardResponse,
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2], default_iti: 100});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).not.toMatch('bar');
    jest.advanceTimersByTime(100);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey(32);
  });
});