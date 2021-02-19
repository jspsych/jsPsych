const root = '../../';

describe('preload plugin', function () {

  beforeEach(function () {
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-preload.js');
  });

  afterEach(function() {
    jest.clearAllMocks();
  })

  test('loads correctly', function () {
    expect(typeof window.jsPsych.plugins['preload']).not.toBe('undefined');
  });

  describe('auto_preload', function() {

    test('auto_preload method works with simple timeline and image stimulus', function () {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });

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

    test('auto_preload method works with simple timeline and audio stimulus', function () {

      require(root + 'plugins/jspsych-audio-keyboard-response.js');

      jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb) => { cb(); });

      var preload = {
        type: 'preload',
        auto_preload: true
      }

      var trial = {
        type: 'audio-keyboard-response',
        stimulus: 'sound/foo.mp3',
      }

      jsPsych.init({
        timeline: [preload, trial]
      });
      
      expect(jsPsych.pluginAPI.preloadAudio.mock.calls[0][0]).toStrictEqual(['sound/foo.mp3']);
      
    });

    test('auto_preload method works with simple timeline and video stimulus', function () {

      require(root + 'plugins/jspsych-video-keyboard-response.js');

      jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb) => { cb(); });

      var preload = {
        type: 'preload',
        auto_preload: true
      }

      var trial = {
        type: 'video-keyboard-response',
        stimulus: 'video/foo.mp4'
      }

      jsPsych.init({
        timeline: [preload, trial]
      });
      
      expect(jsPsych.pluginAPI.preloadVideo.mock.calls[0][0]).toStrictEqual(['video/foo.mp4']);
      
    });

    test('auto_preload method works with nested timeline', function () {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });

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

  });

  describe('trials parameter', function() {

    test('trials parameter works with simple timeline', function () {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });

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

  });

  describe('calls to pluginAPI preload functions', function() {

    test('auto_preload, trials, and manual preload array parameters can be used together', function () {
      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });

      var trial_1 = {
        type: 'image-keyboard-response',
        stimulus: 'img/foo.png',
        render_on_canvas: false
      }

      var trial_2 = {
        type: 'image-keyboard-response',
        stimulus: 'img/bar.png',
        render_on_canvas: false
      }

      var preload = {
        type: 'preload',
        auto_preload: true,
        trials: [trial_2],
        images: ['img/fizz.png']
      }

      jsPsych.init({
        timeline: [preload, trial_1]
      });
      
      expect(jsPsych.pluginAPI.preloadImages.mock.calls.length).toBe(1);
      expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0].length).toBe(3); 
      expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toContain('img/foo.png');
      expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toContain('img/bar.png');
      expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toContain('img/fizz.png');
      
    });

    test('plugin only attempts to load duplicate files once', function () {
      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb) => { cb(); });

      var trial_1 = {
        type: 'image-keyboard-response',
        stimulus: 'img/foo.png',
        render_on_canvas: false
      }

      var trial_2 = {
        type: 'image-keyboard-response',
        stimulus: 'img/foo.png',
        render_on_canvas: false
      }

      var preload = {
        type: 'preload',
        trials: [trial_2],
        images: ['img/foo.png']
      }

      jsPsych.init({
        timeline: [preload, trial_1]
      });
      
      expect(jsPsych.pluginAPI.preloadImages.mock.calls.length).toBe(1);
      expect(jsPsych.pluginAPI.preloadImages.mock.calls[0][0]).toStrictEqual(['img/foo.png']);
      
    });

  });

  describe('continue_after_error and error messages', function() {

    test('experiment continues when image loads successfully', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');
      
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { cb_load(); cb_complete(); });

      var preload = {
        type: 'preload',
        auto_preload: true,
        error_message: 'foo',
        max_load_time: 100
      }

      var trial = {
        type: 'image-keyboard-response',
        stimulus: 'image.png',
        render_on_canvas: false
      }

      jsPsych.init({
        timeline: [preload, trial]
      });

     
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src=\"image.png\" id=\"jspsych-image-keyboard-response-stimulus\"');
      

    });

    test('error_message is shown when continue_after_error is false and files fail', function() {
      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        cb_error({
          source: x,
          error: {
          }
        }); 
      });

      var preload = {
        type: 'preload',
        auto_preload: true,
        error_message: 'foo',
        max_load_time: 100,
        on_error: function(e) {
          expect(e).toContain('img/bar.png');
        }
      }

      var trial = {
        type: 'image-keyboard-response',
        stimulus: 'img/bar.png',
        render_on_canvas: false
      }

      jsPsych.init({
        timeline: [preload, trial]
      });

      expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');

    });

    test('error_message is shown when continue_after_error is false and loading times out', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');
      
      jest.useFakeTimers();

      var mock_fn = jest.fn(function(x) {return x;});
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        // don't return anything here to simulate waiting forever for image to load
      });
      

      var preload = {
        type: 'preload',
        auto_preload: true,
        error_message: 'foo',
        max_load_time: 100,
        on_error: function(e) {
          mock_fn(e);
        }
      }

      var trial = {
        type: 'image-keyboard-response',
        stimulus: 'blue.png',
        render_on_canvas: false
      }

      jsPsych.init({
        timeline: [preload, trial]
      });
      
      jest.advanceTimersByTime(101);
      
      expect(mock_fn).toHaveBeenCalledWith('timeout');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
      

    });

    test('experiment continues when continue_after_error is true and files fail', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var mock_fn = jest.fn(function(x) {return x;});
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        cb_error({
          source: x,
          error: {
          }
        }); 
      });

      var preload = {
        type: 'preload',
        images: ['img/foo.png'],
        error_message: 'bar',
        max_load_time: null,
        continue_after_error: true,
        on_error: function(e) {
          mock_fn('loading failed');
        }
      }

      var trial = {
        type: 'image-keyboard-response',
        stimulus: 'blue.png',
        render_on_canvas: false
      }

      jsPsych.init({
        timeline: [preload, trial]
      });

       
      expect(mock_fn).toHaveBeenCalledWith('loading failed');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src=\"blue.png\" id=\"jspsych-image-keyboard-response-stimulus\"');
      

    });

    test('experiment continues when continue_after_error is true and loading times out', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      jest.useFakeTimers();

      var mock_fn = jest.fn(function(x) {return x;});
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        // don't return anything here to simulate waiting forever for image to load
      });

      var preload = {
        type: 'preload',
        auto_preload: true,
        error_message: 'bar',
        max_load_time: 100,
        continue_after_error: true,
        on_error: function(e) {
          mock_fn(e);
        }
      }

      var trial = {
        type: 'image-keyboard-response',
        stimulus: '../media/blue.png',
        render_on_canvas: false
      }

      jsPsych.init({
        timeline: [preload, trial]
      });

      jest.advanceTimersByTime(101);

      expect(mock_fn).toHaveBeenCalledWith('timeout');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src=\"../media/blue.png\" id=\"jspsych-image-keyboard-response-stimulus\"');
      

    });

    test('detailed error message is shown when continue_after_error is false and show_detailed_errors is true', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var mock_fn = jest.fn(function(x) {return x;});
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        cb_error({
          source: x,
          error: {
          }
        }); 
      });

      var preload = {
        type: 'preload',
        images: ['img/foo.png'],
        error_message: 'bar',
        show_detailed_errors: true,
        on_error: function(e) {
          mock_fn('loading failed');
        }
      }

      jsPsych.init({
        timeline: [preload]
      });

      
      expect(mock_fn).toHaveBeenCalledWith('loading failed');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('Error details');
      

    });

  });

  describe('display while loading', function() {

    test('custom loading message is shown above progress bar if specified', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var preload = {
        type: 'preload',
        images: ['img/foo.png'],
        message: 'bar',
        max_load_time: 100
      }

      jsPsych.init({
        timeline: [preload]
      });

      expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id=\"jspsych-loading-progress-bar-container');

    });

    test('progress bar is shown without message by default', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var preload = {
        type: 'preload',
        images: ['img/foo.png'],
        max_load_time: 100
      }

      jsPsych.init({
        timeline: [preload]
      });

      expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id=\"jspsych-loading-progress-bar-container');
    
    });

    test('progress bar is not shown if show_progress_bar is false', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var preload = {
        type: 'preload',
        images: ['img/foo.png'],
        show_progress_bar: false,
        max_load_time: 100
      }

      jsPsych.init({
        timeline: [preload]
      });

      expect(jsPsych.getDisplayElement().innerHTML).not.toMatch('<div id=\"jspsych-loading-progress-bar-container');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('');

    });

  });

  describe('on_success and on_error parameters', function() {

    test('on_error/on_success callbacks are called during preload trial after each loading success/error', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var mock_fn = jest.fn(function(x) {return x;});
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => {
        if(x.includes('blue.png')){
          cb_load();
          cb_complete();
        } else { 
          cb_error({
            source: x,
            error: {
            }
          });
        }
      });
      jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        cb_error({
          source: x,
          error: {
          }
        }); 
      });
      jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        cb_error({
          source: x,
          error: {
          }
        }); 
      });

      var preload_1 = {
        type: 'preload',
        images: ['foo.png'],
        audio: ['bar.mp3'],
        video: ['buzz.mp4'],
        continue_after_error: true,
        on_error: function(e) {
          mock_fn('loading failed');
        },
        on_success: function(e) {
          mock_fn('loading succeeded');
        }
      }

      var preload_2 = {
        type: 'preload',
        images: ['blue.png'],
        max_load_time: 100,
        on_error: function(e) {
          mock_fn('loading failed');
        },
        on_success: function(e) {
          mock_fn('loading succeeded');
        }
      }

      jsPsych.init({
        timeline: [preload_1, preload_2]
      });

      
      expect(mock_fn.mock.calls[0][0]).toBe('loading failed');
      expect(mock_fn.mock.calls[1][0]).toBe('loading failed');
      expect(mock_fn.mock.calls[2][0]).toBe('loading failed');
      expect(mock_fn.mock.calls[3][0]).toBe('loading succeeded');
      

    });

    test('on_error/on_success callbacks are not called after loading times out', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var mock_fn = jest.fn(function(x) {return x;});
      var cancel_preload_spy = jest.spyOn(jsPsych.pluginAPI, 'cancelPreloads');
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => {
        // empty to simulate timeout
      });
      jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb_complete, cb_load, cb_error) => {
        // empty to simulate timeout
      });
      jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        // empty to simulate timeout
      });
      jest.useFakeTimers();

      var preload = {
        type: 'preload',
        images: ['img/foo.png', 'blue.png'],
        audio: ['audio/bar.mp3'],
        video: ['video/buzz.mp4'],
        continue_after_error: true,
        max_load_time: 100,
        on_error: function(e) {
          if (e == "timeout") {
            mock_fn(e);
          } else {
            mock_fn('loading failed');
          }      
        },
        on_success: function(e) {
          mock_fn('loading succeeded');
        }
      }

      jsPsych.init({
        timeline: [preload]
      });

      jest.advanceTimersByTime(101);
      
      expect(mock_fn).toHaveBeenCalledWith('timeout');
      expect(mock_fn).toHaveBeenLastCalledWith('timeout');
      expect(cancel_preload_spy).toHaveBeenCalled();
      

    });

    test('experiment stops with default error_message and on_error/on_success callbacks are not called after preload trial ends with error', function() {

      require(root + 'plugins/jspsych-image-keyboard-response.js');

      var mock_fn = jest.fn(function(x) {return x;});
      var cancel_preload_spy = jest.spyOn(jsPsych.pluginAPI,'cancelPreloads');
      jest.useFakeTimers();
      jsPsych.pluginAPI.preloadImages = jest.fn((x, cb_complete, cb_load, cb_error) => {
        if(x.includes('blue.png')){
          cb_load();
          cb_complete();
        } else { 
          
        }
      });
      jsPsych.pluginAPI.preloadVideo = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        
      });
      jsPsych.pluginAPI.preloadAudio = jest.fn((x, cb_complete, cb_load, cb_error) => { 
        
      });

      var preload_1 = {
        type: 'preload',
        images: ['img/foo.png'],
        audio: ['audio/bar.mp3'],
        video: ['video/buzz.mp4'],
        max_load_time: 100,
        on_error: function(e) {
          if (e == 'timeout') {
            mock_fn(e);
          } else {
            mock_fn('loading failed');
          }
        },
        on_success: function(e) {
          mock_fn('loading succeeded');
        }
      }

      var preload_2 = {
        type: 'preload',
        images: ['../media/blue.png'],
        max_load_time: 100,
        on_error: function(e) {
          mock_fn('loading failed');
        },
        on_success: function(e) {
          mock_fn('loading succeeded');
        }
      }

      jsPsych.init({
        timeline: [preload_1, preload_2]
      });

      jest.advanceTimersByTime(101);
      
      expect(mock_fn).toHaveBeenCalledWith('timeout');
      expect(mock_fn).toHaveBeenLastCalledWith('timeout');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('The experiment failed to load.');
      expect(cancel_preload_spy).toHaveBeenCalled();
      

    });

  });

});
