const root = '../';

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-text.js');
});

describe('automatic progress bar', function(){

  test('progress bar does not display by default', function(){
    var trial = {
      type: 'text',
      text: 'foo'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(document.querySelector('#jspsych-progressbar-container')).toBe(null);

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });

  test('progress bar displays when show_progress_bar is true', function(){
    var trial = {
      type: 'text',
      text: 'foo'
    }

    jsPsych.init({
      timeline: [trial],
      show_progress_bar: true
    });

    expect(document.querySelector('#jspsych-progressbar-container').innerHTML).toMatch('<span>Completion Progress</span><div id="jspsych-progressbar-outer"><div id="jspsych-progressbar-inner"></div></div>');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });

  test('progress bar automatically updates by default', function(){
    var trial = {
      type: 'text',
      text: 'foo'
    }

    jsPsych.init({
      timeline: [trial, trial, trial, trial],
      show_progress_bar: true
    });

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('25%');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('50%');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('75%');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('100%');

  });

  test('progress bar does not automatically update when auto_update_progress_bar is false', function(){
    var trial = {
      type: 'text',
      text: 'foo'
    }

    jsPsych.init({
      timeline: [trial, trial, trial, trial],
      show_progress_bar: true,
      auto_update_progress_bar: false
    });

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

  });

  test('setProgressBar() manually', function(){
    var trial = {
      type: 'text',
      text: 'foo',
      on_finish: function(){
        jsPsych.setProgressBar(0.2);
      }
    }

    var trial_2 = {
      type: 'text',
      text: 'foo',
      on_finish: function(){
        jsPsych.setProgressBar(0.8);
      }
    }

    jsPsych.init({
      timeline: [trial, trial_2],
      show_progress_bar: true,
      auto_update_progress_bar: false
    });

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('20%');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(document.querySelector('#jspsych-progressbar-inner').style.width).toBe('80%');

  });

});
