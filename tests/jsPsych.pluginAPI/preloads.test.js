const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('getAutoPreloadList', function(){
  test('gets whole timeline when no argument provided', function(){
    require(root + 'plugins/jspsych-image-keyboard-response.js');

    var t = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png',
      render_on_canvas: false
    }

    var timeline = [t];

    jsPsych.init({
      timeline: timeline
    })

    var images = jsPsych.pluginAPI.getAutoPreloadList().images;

    expect(images[0]).toBe('img/foo.png');
  })
  test('works with images', function(){
    require(root + 'plugins/jspsych-image-keyboard-response.js');

    var t = {
      type: 'image-keyboard-response',
      stimulus: 'img/foo.png'
    }

    var timeline = [t];

    var images = jsPsych.pluginAPI.getAutoPreloadList(timeline).images;

    expect(images[0]).toBe('img/foo.png');
  })
})