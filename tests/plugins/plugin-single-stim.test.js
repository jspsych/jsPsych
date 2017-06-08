const root = '../../';

jest.useFakeTimers();

describe('single-stim plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-single-stim.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['single-stim']).not.toBe('undefined');
  });

  test('displays image by default', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '../media/blue.png'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src="../media/blue.png" id="jspsych-single-stim-stimulus">');
  });

  test('displays html when is_html is true', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div>');
  });

  test('display should clear after key press', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });

  test('display should not clear after key press when choices is jsPsych.NO_KEYS', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      choices: jsPsych.NO_KEYS
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div>');
  });

  test('display should only clear when key is in choices array', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      choices: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });

  test('prompt should append html below stimulus', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      prompt: '<div id="foo">this is the prompt</div>'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div><div id="foo">this is the prompt</div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

  });

  test('timing_stim should set visibility of content to hidden after time has elapsed', function(){

    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      timing_stim: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div>');

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus" style="visibility: hidden;"><p>hello</p></div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

  });

  test('timing_response should end trial after time has elapsed', function(){

    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div>');

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

  });

  test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    var trial = {
      type: 'single-stim',
      stimulus: '<p>hello</p>',
      is_html: true,
      response_ends_trial: false,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus" class=" responded"><p>hello</p></div>');

    jest.runAllTimers();
  });

  test('should accept functions as parameters', function(){

    var trial = {
      type: 'single-stim',
      stimulus: function(){ return '<p>hello</p>'; },
      is_html: function(){ return true; },
      choices: function(){ return ['j']; },
      prompt: function(){ return '<div>prompt</div>'; },
      timing_response: function(){ return 1000; },
      timing_stim: function(){ return 500; },
      response_ends_trial: function(){ return false; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div><div>prompt</div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div><div>prompt</div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>hello</p></div><div>prompt</div>');

    jest.runTimersToTime(500);

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-single-stim-stimulus" style="visibility: hidden;"><p>hello</p></div><div>prompt</div>');

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });
});
