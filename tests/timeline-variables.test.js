const root = '../';

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-text.js');
});

describe('randomize order', function(){
  test('holder', function(){
    expect(true).toBe(true);
  });
});

describe('repetitons', function(){
  test('holder', function(){
    expect(true).toBe(true);
  });
});

describe('sampling', function(){
  test('holder', function(){
    expect(true).toBe(true);
  });

  test('sampling functions run when timeline loops', function(){

    var count = 0;
    const reps = 100;

    var trial = {
      timeline: [{
        type: 'text',
        text: jsPsych.timelineVariable('text')
      }],
      timeline_variables: [
        {text: '1'},
        {text: '2'},
        {text: '3'}
      ],
      sample: {
        type: 'without-replacement',
        size: 1
      },
      loop_function: function(){
        count++;
        return(count < reps);
      }
    }

    jsPsych.init({
      timeline: [trial]
    });

    var result_1 = [];
    var result_2 = [];
    for(var i=0; i<reps/2; i++){
      var html = jsPsych.getDisplayElement().innerHTML;
      result_1.push(html);
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
      var html = jsPsych.getDisplayElement().innerHTML;
      result_2.push(html);
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    }

    expect(result_1).not.toEqual(result_2);
  });
});
