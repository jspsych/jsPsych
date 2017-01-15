const root = '../../';

require(root + 'jspsych.js');

require(root + 'plugins/jspsych-text.js');

describe('Basic data recording', function(){
  test('should be able to get rt after running experiment', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
    expect(jsPsych.data.getData().select('rt').count()).toBe(1);
  })
})

describe('#addProperties', function(){

  test('should add data to all trials if called before experiment starts', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.data.addProperties({'testprop': 1});
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains testprop
    expect(jsPsych.data.getData().select('testprop').count()).toBe(1);
  });

  test('should add data to all trials retroactively', function(){
    jsPsych.data._fullreset();
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains testprop
    expect(jsPsych.data.getData().select('testprop').count()).toBe(0);
    jsPsych.data.addProperties({'testprop': 1});
    expect(jsPsych.data.getData().select('testprop').count()).toBe(1);
  });

});

describe('#addDataToLastTrial', function(){
  test('should add any data properties to the last trial', function(){
    jsPsych.data._fullreset();
    var timeline = [
      {
        type: 'text',
        text: 'hello',
        on_finish: function(){
          jsPsych.data.addDataToLastTrial({testA: 1, testB: 2});
        }
      }
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check data structure
    expect(jsPsych.data.getData().select('testA').values[0]).toBe(1);
    expect(jsPsych.data.getData().select('testB').values[0]).toBe(2);
  });
});

describe('#getLastTrialData', function(){
  test('should return a new DataCollection with only the last trial\'s data', function(){
    jsPsych.data._fullreset();
    var timeline = [
      {type: 'text', text:'hello'},
      {type: 'text', text:'world'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // click through second trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check data structure
    expect(jsPsych.data.getLastTrialData().select('trial_index').values[0]).toBe(1);
  });
});

describe('#getLastTimelineData', function(){
  test('should return a new DataCollection with only the last timeline\'s data', function(){
    jsPsych.data._fullreset();
    var timeline = [
      {
        timeline:
        [
          {type: 'text', text:'hello'},
          {type: 'text', text:'world'}
        ]
      },
      {
        timeline:
        [
          {type: 'text', text:'second'},
          {type: 'text', text:'time'}
        ]
      }
    ];
    jsPsych.init({timeline:timeline});
    // click through all four trials
    for(var i=0; i<4; i++){
      document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    }
    // check data structure
    expect(jsPsych.data.getLastTimelineData().count()).toBe(2);
    expect(jsPsych.data.getLastTimelineData().select('trial_index').values[0]).toBe(2);
    expect(jsPsych.data.getLastTimelineData().select('trial_index').values[1]).toBe(3);
  });
});

describe('#displayData', function(){
  test('should display in json format', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // overwrite data with custom data
    var data = [{col1: 1, col2: 2}, {col1: 3, col2: 4}]
    jsPsych.data._customInsert(data);
    // display data in json format
    jsPsych.data.displayData('json');
    // get display element HTML
    var html = jsPsych.getDisplayElement().innerHTML;
    expect(html).toBe('<pre id="jspsych-data-display">'+JSON.stringify(data, null, '\t')+'</pre>');
  });
  test('should display in csv format', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // overwrite data with custom data
    var data = [{col1: 1, col2: 2}, {col1: 3, col2: 4}]
    jsPsych.data._customInsert(data);
    // display data in json format
    jsPsych.data.displayData('csv');
    // get display element HTML
    var html = jsPsych.getDisplayElement().innerHTML;
    expect(html).toBe("<pre id=\"jspsych-data-display\">\"col1\",\"col2\"\r\n\"1\",\"2\"\r\n\"3\",\"4\"\r\n</pre>");
  });
});
