const root = '../../';

describe('preload plugin', function () {

  beforeEach(function () {
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-preload.js');
  });

  test('loads correctly', function () {
    expect(typeof window.jsPsych.plugins['preload']).not.toBe('undefined');
  });

  test('auto_preload method works with simple timeline', function () {

    require(root + 'plugins/jspsych-image-keyboard-response.js');

    jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

    var preload = {
      type: 'preload',
      auto_preload: true
    }

    var trial = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false
    }

    jsPsych.init({
      timeline: [preload, trial]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

});
