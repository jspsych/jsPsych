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
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

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
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

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
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    // second trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    // third trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(data_count).toEqual([1,1,1]);
    expect(jsPsych.data.get().count()).toBe(3);

  });
});
