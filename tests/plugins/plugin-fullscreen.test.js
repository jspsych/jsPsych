const root = '../../';

jest.useFakeTimers();

describe('fullscreen plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-fullscreen.js');
    // require(root + 'plugins/jspsych-text.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['fullscreen']).not.toBe('undefined');
  });

  // can't test this right now because jsdom doesn't support fullscreen API.

  /*test('launches fullscreen mode by default', function(){
    var trial = {
      type: 'fullscreen',
      delay_after: 0
    }

    var text = {
      type: 'html-keyboard-response',
      stimulus: 'fullscreen'
    }

    jsPsych.init({
      timeline: [trial, text]
    });

    expect(document.fullscreenElement).toBeUndefined();
    console.log(jsPsych.getDisplayElement().requestFullscreen);
    document.querySelector('#jspsych-fullscreen-btn').dispatchEvent(new MouseEvent('click', {}));

    expect(document.fullscreenElement).not.toBeUndefined();
  });*/

});
