/**
 * @jest-environment jsdom
 */

const root = '../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

test('jsPsych should be in the window object', function(){
  expect(require('../jspsych')).not.toBe('undefined')
  expect(typeof window.jsPsych).not.toBe('undefined');
});
