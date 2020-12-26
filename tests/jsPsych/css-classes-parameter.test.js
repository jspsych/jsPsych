const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('The css_classes parameter for trials', function(){

  test('Adds a single CSS class to the root jsPsych element', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: ['foo']
    }

    jsPsych.init({timeline:[trial]});

    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey(32);
  })

  test('Removes the added classes at the end of the trial', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: ['foo']
    }

    jsPsych.init({timeline:[trial]});
    
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(false);

  })

  test('Class inherits in nested timelines', function(){
    var tm = {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: '<p>foo</p>',
      }],
      css_classes: ['foo']
    }

    jsPsych.init({timeline:[tm]});
    
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(false);

  })

  test('Parameter works when defined as a function', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: function(){ 
        return ['foo']
      }
    }

    jsPsych.init({timeline:[trial]});
    
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey(32);
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(false);

  })
})