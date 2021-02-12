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
    utils.pressKey('a');
    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    utils.pressKey('a');
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
    utils.pressKey('a');

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    utils.pressKey('a');

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
    utils.pressKey('a');

    // second trial
    utils.pressKey('a');

    // third trial
    utils.pressKey('a');

    expect(data_count).toEqual([1,1,1]);
    expect(jsPsych.data.get().count()).toBe(3);

  });

  test('timeline variables from nested timelines are available in loop function', function(){

    var counter = 0;

    var trial2 = {
      type: 'html-keyboard-response',
      stimulus: jsPsych.timelineVariable('word')
    }

    var innertimeline = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      loop_function: function(){
        if(jsPsych.timelineVariable('word') == 'b' && counter < 2){
          counter++;
          return true;
        } else {
          counter = 0;
          return false;
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
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('b');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('c');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
  });

  test('only runs once when timeline variables are used', function(){
    var count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      timeline_variables:[{a:1},{a:2}],
      loop_function: function(){
        count++;
        return false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    // first trial
    utils.pressKey('a');

    expect(count).toBe(0);

    // second trial
    utils.pressKey('a');

    expect(count).toBe(1);
  })

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
    utils.pressKey('a');
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
    utils.pressKey('a');

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    // clear
    utils.pressKey('a');
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
    utils.pressKey('a');

    expect(conditional_count).toBe(2);

    // second trial
    utils.pressKey('a');

    expect(conditional_count).toBe(2);
  });

  test('executes only once even when repetitions is > 1', function(){
    var conditional_count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      repetitions: 2,
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
    utils.pressKey('a');

    expect(conditional_count).toBe(1);

    // second trial
    utils.pressKey('a');

    expect(conditional_count).toBe(1);
  })

  test('executes only once when timeline variables are used', function(){
    var conditional_count = 0;

    var trial = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: 'foo'
      }],
      timeline_variables: [
        {a:1},
        {a:2}
      ],
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
    utils.pressKey('a');

    expect(conditional_count).toBe(1);

    // second trial
    utils.pressKey('a');

    expect(conditional_count).toBe(1);
  })

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
        if(jsPsych.timelineVariable('word') == 'b'){
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
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('b');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('c');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
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

    utils.pressKey('a');

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('woo');

    utils.pressKey('a');

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

    utils.pressKey('a');

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    utils.pressKey('a');

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('woo');

    utils.pressKey('a');
  })
});


describe('nested timelines', function() {
  test('works without other parameters', function() {
    var t1 = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    };

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    };
    
    var trials = {
      timeline: [t1, t2]
    };

    jsPsych.init({
      timeline: [trials]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');

    utils.pressKey('a');

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');

    utils.pressKey('a');

  })
})

describe('add node to end of timeline', function(){

  test('adds node to end of timeline', function() {
    var new_trial = {
       type: 'html-keyboard-response',
       stimulus: 'bar'
    };

    var new_timeline = {
      timeline: [new_trial]
    };

    var timeline = [
      {
        type: 'html-keyboard-response',
        stimulus: 'foo',
        on_start: function() {
          jsPsych.addNodeToEndOfTimeline(new_timeline);
        }
      }
    ];

    jsPsych.init({
      timeline: timeline
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey('a');
  });

});

