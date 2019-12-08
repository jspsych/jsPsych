const root = '../../';

require(root + 'src/jspsych.js');

test('jsPsych should be in the window object', function(){
  expect(typeof window.jsPsych).not.toBe('undefined');
});
