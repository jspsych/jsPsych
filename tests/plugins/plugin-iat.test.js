const root = '../../';

jest.useFakeTimers();

describe('iat plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-iat.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['iat']).not.toBe('undefined');
  });

  test('displays image by default', function(){
    var trial = {
      type: 'iat',
      stimulus: '../media/blue.png'
    }

    jsPsych.init({
      timeline: [trial]
    });


    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src="../media/blue.png" id="jspsych-iat-stim">');
  });

  test('displays html when is_html is true', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stimu"><p>hello</p></div>');
  });

  test('display should clear after key press', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });

  test('display should not clear after key press when choices is jsPsych.NO_KEYS', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      choices: jsPsych.NO_KEYS
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div>');
  });

  test('display should only clear when key is in choices array', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      choices: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div>');

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });

  test('prompt should append html below stimulus', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      prompt: '<div id="foo">this is the prompt</div>'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div><div id="foo">this is the prompt</div>');

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

  });

  test('timing_response should end trial after time has elapsed; only if display_feedback is false', function(){

    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      display_feedback: false,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div>');

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

  });

  test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      response_ends_trial: false,
      display_feedback: false,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim" class=" responded"><p>hello</p></div>');

    jest.runAllTimers();
  });

  test('should accept functions as parameters', function(){

    var trial = {
      type: 'iat',
      stimulus: function(){ return '<p>hello</p>'; },
      is_html: function(){ return true; },
      choices: function(){ return ['j']; },
      prompt: function(){ return '<div>prompt</div>'; },
      timing_response: function(){ return 1000; },
      response_ends_trial: function(){ return false; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div><div>prompt</div>');

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div><div>prompt</div>');

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim"><p>hello</p></div><div>prompt</div>');

    jest.runTimersToTime(500);

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<div id="jspsych-iat-stim" style="visibility: hidden;"><p>hello</p></div><div>prompt</div>');

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });
});