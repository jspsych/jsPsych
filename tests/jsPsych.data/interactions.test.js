const root = '../../';

describe('Data recording', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');
  })

  test('record focus events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    window.dispatchEvent(new Event('focus'));
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check data
    expect(jsPsych.data.getInteractionData().filter({event: 'focus'}).count()).toBe(1);
  })

  test('record blur events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    window.dispatchEvent(new Event('blur'));
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check data
    expect(jsPsych.data.getInteractionData().filter({event: 'blur'}).count()).toBe(1);
  })

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip('record fullscreenenter events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  });

  test.skip('record fullscreenexit events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  });

})

describe('on_interaction_data_update', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');
  })

  test('fires for blur', function(){

    var updatefn = jest.fn();

    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({
      timeline:timeline,
      on_interaction_data_update: updatefn
    });
    window.dispatchEvent(new Event('blur'));
    expect(updatefn.mock.calls.length).toBeGreaterThanOrEqual(1); // >= because of jsdom window not isolated to this test.

    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });

  test('fires for focus', function(){
    var updatefn = jest.fn();

    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({
      timeline:timeline,
      on_interaction_data_update: updatefn
    });
    window.dispatchEvent(new Event('focus'));
    expect(updatefn.mock.calls.length).toBeGreaterThanOrEqual(1); // >= because of jsdom window not isolated to this test.
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  })

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip('fires for fullscreenexit', function(){

  })

  test.skip('fires for fullscreenenter', function(){

  })
})
