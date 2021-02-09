const root = '../../';
const utils = require('../testing-utils.js');

describe('Data recording', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');
  })

  test('record focus events', function(){
    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({timeline:timeline});
    window.dispatchEvent(new Event('focus'));
    // click through first trial
    utils.pressKey('a');
    // check data
    expect(jsPsych.data.getInteractionData().filter({event: 'focus'}).count()).toBe(1);
  })

  test('record blur events', function(){
    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({timeline:timeline});
    window.dispatchEvent(new Event('blur'));
    // click through first trial
    utils.pressKey('a');
    // check data
    expect(jsPsych.data.getInteractionData().filter({event: 'blur'}).count()).toBe(1);
  })

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip('record fullscreenenter events', function(){
    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    utils.pressKey('a');
    // check if data contains rt
  });

  test.skip('record fullscreenexit events', function(){
    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    utils.pressKey('a');
    // check if data contains rt
  });

})

describe('on_interaction_data_update', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');
  })

  test('fires for blur', function(){

    var updatefn = jest.fn();

    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({
      timeline:timeline,
      on_interaction_data_update: updatefn
    });
    window.dispatchEvent(new Event('blur'));
    expect(updatefn.mock.calls.length).toBeGreaterThanOrEqual(1); // >= because of jsdom window not isolated to this test.

    // click through first trial
    utils.pressKey('a');
  });

  test('fires for focus', function(){
    var updatefn = jest.fn();

    var timeline = [
      {type: 'html-keyboard-response', stimulus: 'hello'}
    ];
    jsPsych.init({
      timeline:timeline,
      on_interaction_data_update: updatefn
    });
    window.dispatchEvent(new Event('focus'));
    expect(updatefn.mock.calls.length).toBeGreaterThanOrEqual(1); // >= because of jsdom window not isolated to this test.
    // click through first trial
    utils.pressKey('a');
  })

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip('fires for fullscreenexit', function(){

  })

  test.skip('fires for fullscreenenter', function(){

  })
})
