/**
 * @jest-environment jsdom
 */

const root = '../build/';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych

test('jsPsych should be useable as a module', function() {
  expect(jsPsych).not.toBe('undefined')
  expect(jsPsych).not.toBe({})
})

test('jsPsych should be in the window object', function(){
  expect(typeof window.jsPsych).not.toBe('undefined');
});
