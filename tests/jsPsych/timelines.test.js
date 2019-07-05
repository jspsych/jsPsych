const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('loop function', function(){

  test('repeats a timeline when returns true', function(){

    var count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      loop_function: function(){
        if(count < 1){
          count++;
          return true;
        } else {
          return false;
        }
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    // first trial
    utils.pressKey(32);
    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    utils.pressKey(32);
    expect(jsPsych.data.get().count()).toBe(2);

  });

  test('does not repeat when returns false', function(){

    var count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      loop_function: function(){
        return false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    // first trial
    utils.pressKey(32);

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    utils.pressKey(32);

    expect(jsPsych.data.get().count()).toBe(1);

  });

  test('gets the data from the most recent iteration', function(){

    var data_count = [];
    var count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      loop_function: function(data){
        data_count.push(data.count());
        if(count < 2){
          count++;
          return true;
        } else {
          return false;
        }
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    // first trial
    utils.pressKey(32);

    // second trial
    utils.pressKey(32);

    // third trial
    utils.pressKey(32);

    expect(data_count).toEqual([1,1,1]);
    expect(jsPsych.data.get().count()).toBe(3);

  });

});

describe('conditional function', function(){

  test('skips the timeline when returns false', function(){

    var conditional = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      conditional_function: function(){
        return false;
      }
    }

    var trial = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({
      timeline: [conditional, trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    // clear
    utils.pressKey(32);
  });

  test('completes the timeline when returns true', function(){
    var conditional = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      conditional_function: function(){
        return true;
      }
    }

    var trial = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({
      timeline: [conditional, trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');

    // next
    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    // clear
    utils.pressKey(32);
  });

  test('executes on every loop of the timeline', function(){

    var count = 0;
    var conditional_count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      loop_function: function(){
        if(count < 1){
          count++;
          return true;
        } else {
          return false;
        }
      },
      conditional_function: function(){
        conditional_count++;
        return true;
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(conditional_count).toBe(1);

    // first trial
    utils.pressKey(32);

    expect(conditional_count).toBe(2);

    // second trial
    utils.pressKey(32);

    expect(conditional_count).toBe(2);
  });

  test('timeline variables from nested timelines are available', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    }

    var trial2 = {
      type: 'html-keyboard-response',
      stimulus: jsPsych.timelineVariable('word')
    }

    var innertimeline = {
      timeline: [trial],
      conditional_function: function(){
        if(jsPsych.timelineVariable('word', true) == 'b'){
          return false;
        } else {
          return true;
        }
      }
    }

    var outertimeline = {
      timeline: [trial2, innertimeline],
      timeline_variables: [
        {word: 'a'},
        {word: 'b'},
        {word: 'c'}
      ]
    }

    jsPsych.init({
      timeline: [outertimeline]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('a');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('b');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('c');
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey(32);
  });

});

describe('endCurrentTimeline', function(){

  test('stops the current timeline, skipping to the end after the trial completes', function(){
    var t = {
      timeline: [
        {
          type: 'html-keyboard-response',
          stimulus: 'foo',
          on_finish: function(){
            jsPsych.endCurrentTimeline();
          }
        },
        {
          type: 'html-keyboard-response',
          stimulus: 'bar'
        }
      ]
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'woo'
    }

    jsPsych.init({
      timeline: [t, t2]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('woo');

    utils.pressKey(32);

  });

  test('works inside nested timelines', function(){
    var t = {
      timeline: [
        {
          timeline: [
            {
              type: 'html-keyboard-response',
              stimulus: 'foo',
              on_finish: function(){
                jsPsych.endCurrentTimeline();
              }
            },
            {
              type: 'html-keyboard-response',
              stimulus: 'skip me!'
            }
          ]
        },
        {
          type: 'html-keyboard-response',
          stimulus: 'bar'
        }
      ]
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'woo'
    }

    jsPsych.init({
      timeline: [t, t2]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('woo');

    utils.pressKey(32);
  })
});
