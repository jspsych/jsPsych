const root = '../../';

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
      stimulus: '<p>hello</p>'
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  });
});
