const root = '../../';

require(root + 'jspsych.js');
require(root + 'plugins/jspsych-single-stim.js');

test('jsPsych should be in the window object', function(){
  expect(typeof window.jsPsych).not.toBe('undefined');
});

test('the single-stim plugin should be loaded', function(){
  expect(typeof window.jsPsych.plugins['single-stim']).not.toBe('undefined');
})

var trial = {
  type: 'single-stim',
  stimulus: '<p>Hello</p>',
  is_html: true
}

jsPsych.init({
  timeline: [trial]
});

test('HMTL stimulus should display', function(){
  var display_element = jsPsych.getDisplayElement();
  expect(display_element.innerHTML).toBe('<div id="jspsych-single-stim-stimulus"><p>Hello</p></div>');
});

test('Display should clear after keypress', function(){
  document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
  document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  var display_element = jsPsych.getDisplayElement();
  expect(display_element.innerHTML).toBe('');
})
