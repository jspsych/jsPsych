require('../jspsych.js');
require('../plugins/jspsych-text.js');

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
})
