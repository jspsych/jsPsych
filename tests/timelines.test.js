const root = '../';

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-text.js');
});

describe('loop function', function(){

  test('repeats a timeline when returns true', function(){

    var count = 0;

    var trial = {
      timeline: [{
        type: 'text',
        text: 'foo'
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
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(2);

  });

  test('does not repeat when returns false', function(){

    var count = 0;

    var trial = {
      timeline: [{
        type: 'text',
        text: 'foo'
      }],
      loop_function: function(){
        return false
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    // first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(1);

  });

  test('gets the data from the most recent iteration', function(){

    var data_count = [];
    var count = 0;

    var trial = {
      timeline: [{
        type: 'text',
        text: 'foo'
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
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    // second trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    // third trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(data_count).toEqual([1,1,1]);
    expect(jsPsych.data.get().count()).toBe(3);

  });

});

describe('conditional function', function(){

  test('skips the timeline when returns false', function(){

    var conditional = {
      timeline: [{
        type: 'text',
        text: 'foo'
      }],
      conditional_function: function(){
        return false;
      }
    }

    var trial = {
      type: 'text',
      text: 'bar'
    }

    jsPsych.init({
      timeline: [conditional, trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('bar');

    // clear
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });

  test('completes the timeline when returns true', function(){
    var conditional = {
      timeline: [{
        type: 'text',
        text: 'foo'
      }],
      conditional_function: function(){
        return true;
      }
    }

    var trial = {
      type: 'text',
      text: 'bar'
    }

    jsPsych.init({
      timeline: [conditional, trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('foo');

    // next
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('bar');

    // clear
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });

  test('executes on every loop of the timeline', function(){

    var count = 0;
    var conditional_count = 0;

    var trial = {
      timeline: [{
        type: 'text',
        text: 'foo'
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
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(conditional_count).toBe(2);

    // second trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(conditional_count).toBe(2);
  });

});

describe('endCurrentTimeline', function(){

  test('stops the current timeline, skipping to the end after the trial completes', function(){
    var t = {
      timeline: [
        {
          type: 'text',
          text: 'foo',
          on_finish: function(){
            jsPsych.endCurrentTimeline();
          }
        },
        {
          type: 'text',
          text: 'bar',
        }
      ]
    }

    jsPsych.init({
      timeline: [t, {type: 'text', text: 'woo'}]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('foo');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('woo');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

  });

});
