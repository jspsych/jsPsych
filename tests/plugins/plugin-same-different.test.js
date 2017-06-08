const root = '../../';

jest.useFakeTimers();

describe('same-different plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-same-different.js');
  });

  test('loads correctly', function(){
    expect(window.jsPsych.plugins['same-different']).not.toBeUndefined();
  });

  test('works with default parameters', function(){
    var trial = {
      type: 'same-different',
      stimuli: ['../media/blue.png','../media/blue.png'],
      answer: 'same'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img class="jspsych-same-different-stimulus" src="../media/blue.png">');
    jest.runTimersToTime(1000);
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
    jest.runTimersToTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img class="jspsych-same-different-stimulus" src="../media/blue.png">');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 81}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 81}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    expect(jsPsych.data.get().values()[0].correct).toBe(true);

  });

  test('check when timing_first_stim is -1', function(){
    var trial = {
      type: 'same-different',
      stimuli: ['../media/blue.png','../media/blue.png'],
      answer: 'same',
      timing_first_stim: -1
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img class="jspsych-same-different-stimulus" src="../media/blue.png">');
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 81}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 81}));
    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
    jest.runTimersToTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe('<img class="jspsych-same-different-stimulus" src="../media/blue.png">');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 81}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 81}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');

    expect(jsPsych.data.get().values()[0].correct).toBe(true);

  });

});
