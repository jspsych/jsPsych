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

  test('auto_preload method works with nested timeline', function () {

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
      render_on_canvas: false,
      timeline: [
        {stimulus: 'img/foo.png'}
      ]
    }

    jsPsych.init({
      timeline: [preload, trial]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('auto_preload method works with looping timeline', function () {

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

    var count = 0;
    var loop = {
      timeline: [trial],
      loop_function: function() {
        if (count == 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    jsPsych.init({
      timeline: [preload, loop]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('auto_preload method works with conditional timeline', function () {

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

    var count = 0;
    var conditional = {
      timeline: [trial],
      conditional_function: function() {
        if (count == 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    jsPsych.init({
      timeline: [preload, conditional]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('auto_preload method works with timeline variables when stim is statically defined in trial object', function () {

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
      render_on_canvas: false,
      data: jsPsych.timelineVariable('data')
    }

    var trial_procedure = {
      timeline: [trial],
      timeline_variables: [
        {data: {trial: 1}},
        {data: {trial: 2}},
        {data: {trial: 3}}
      ]
    }

    jsPsych.init({
      timeline: [preload, trial_procedure]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('trials parameter works with simple timeline', function () {

    require(root + 'plugins/jspsych-image-keyboard-response.js');

    jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

    var trial = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false
    }

    var preload = {
      type: 'preload',
      trials: [trial]
    }

    jsPsych.init({
      timeline: [preload]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('trials parameter works with looping timeline', function () {

    require(root + 'plugins/jspsych-image-keyboard-response.js');

    jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

    var trial = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false
    }

    var count = 0;
    var loop = {
      timeline: [trial],
      loop_function: function() {
        if (count == 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    var preload = {
      type: 'preload',
      trials: [loop]
    }

    jsPsych.init({
      timeline: [preload]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('trials parameter works with conditional timeline', function () {

    require(root + 'plugins/jspsych-image-keyboard-response.js');

    jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

    var trial = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false
    }

    var count = 0;
    var conditional = {
      timeline: [trial],
      conditional_function: function() {
        if (count == 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    var preload = {
      type: 'preload',
      trials: [conditional]
    }

    jsPsych.init({
      timeline: [preload]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('trials parameter works with timeline variables when stim is statically defined in trial object', function () {

    require(root + 'plugins/jspsych-image-keyboard-response.js');

    jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });
    jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

    var trial = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false,
      data: jsPsych.timelineVariable('data')
    }

    var trial_procedure = {
      timeline: [trial],
      timeline_variables: [
        {data: {trial: 1}},
        {data: {trial: 2}},
        {data: {trial: 3}}
      ]
    }

    var preload = {
      type: 'preload',
      trials: [trial_procedure]
    }

    jsPsych.init({
      timeline: [preload]
    });
    
    expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
  });

  test('auto_preload, trials, and manual preload array parameters can be used together', function () {

  });

  test('plugin only attempts to load duplicate files once', function () {

  });

  test('error_message is shown when continue_after_error is false and files fail', function() {

  });

  test('error_message is shown when continue_after_error is false and loading times out', function() {

  });

  test('experiment continues when continue_after_error is true and files fail', function() {

  });

  test('experiment continues when continue_after_error is true and loading times out', function() {

  });

  test('detailed error message is shown when continue_after_error is false and show_detailed_errors is true', function() {

  });

  test('custom loading message is shown if specified', function() {

  });

  test('progress bar is shown without message by default', function() {

  });

  test('progress bar is not shown if show_progress_bar is false', function() {

  });

  test('on_error callback parameter is called after loading error', function() {

  });

  test('on_success callback parameter is called after loading success', function() {

  });

  test('on_error callback parameter is not called after loading times out', function() {

  });

  test('on_success callback parameter is not called after loading times out', function() {

  });

});
