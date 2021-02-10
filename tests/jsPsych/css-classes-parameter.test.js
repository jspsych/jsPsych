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
    utils.pressKey('a');
  })

  test('Gracefully handles single class when not in array', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: 'foo'
    }

    jsPsych.init({timeline:[trial]});

    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey('a');
  })

  test('Removes the added classes at the end of the trial', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: ['foo']
    }

    jsPsych.init({timeline:[trial]});
    
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey('a');
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
    utils.pressKey('a');
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
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(false);

  })

  test('Parameter works when defined as a timeline variable', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: '<p>foo</p>',
      css_classes: jsPsych.timelineVariable('css')
    }

    var t = {
      timeline: [trial],
      timeline_variables: [
        {css: ['foo']}
      ]
    }

    jsPsych.init({timeline:[t]});
    
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(true);
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().classList.contains('foo')).toBe(false);

  })
})