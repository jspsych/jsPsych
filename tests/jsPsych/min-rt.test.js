const root = '../../';
const utils = require('../testing-utils.js');

// ideally, use fake timers for this test, but 'modern' timers that work
// with performance.now() break something in the first test. wait for fix?
//jest.useFakeTimers('modern');
//jest.useFakeTimers();

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('minimum_valid_rt parameter', function(){
  test('has a default value of 0', function(){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2]});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey('a');
  });

  test('correctly prevents fast responses when set', function(done){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2], minimum_valid_rt: 100});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    setTimeout(function(){
      utils.pressKey('a');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
      utils.pressKey('a');
      done();
    }, 100)
    
  });
});