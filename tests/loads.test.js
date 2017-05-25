const root = '../';

require(root + 'jspsych.js');

test('jsPsych should be in the window object', function(){
  expect(typeof window.jsPsych).not.toBe('undefined');
});
