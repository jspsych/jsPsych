const root = '../';
const utils = require('./testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
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
        type: 'html-keyboard-response',
        stimulus: jsPsych.timelineVariable('stimulus')
      }],
      timeline_variables: [
        {stimulus: '1'},
        {stimulus: '2'},
        {stimulus: '3'}
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
      utils.pressKey(32);
      var html = jsPsych.getDisplayElement().innerHTML;
      result_2.push(html);
      utils.pressKey(32);
    }

    expect(result_1).not.toEqual(result_2);
  });
});

describe('timeline variables are correctly evaluated', function(){
  test('when used as trial type parameter', function(){
    require(root + 'plugins/jspsych-html-button-response.js');

    var tvs = [
      {type: 'html-keyboard-response'},
      {type: 'html-button-response'}
    ]

    var timeline = [];

    timeline.push({
      timeline: [{
        type: jsPsych.timelineVariable('type'),
        stimulus: 'hello',
        choices: ['a','b']
      }],
      timeline_variables: tvs
    });

    jsPsych.init({
      timeline: timeline
    });

    expect(jsPsych.getDisplayElement().innerHTML).not.toMatch('button');

    utils.pressKey(65); // 'a'

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('button');
  });

  test('when used with a plugin that has a FUNCTION parameter type', function(done){
    require(root + 'plugins/jspsych-call-function.js');

    const mockFn = jest.fn();

    var tvs = [
      {fn: function() { mockFn('1'); }},
      {fn: function() { mockFn('2'); }}
    ];

    var timeline = [];

    timeline.push({
      timeline: [{
        type: 'call-function',
        func: jsPsych.timelineVariable('fn')
      }],
      timeline_variables: tvs
    });

    jsPsych.init({
      timeline: timeline,
      on_finish: function(){
        expect(mockFn.mock.calls.length).toBe(2);
        done();
      }
    });


  })
})
