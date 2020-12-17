const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
  require(root + 'plugins/jspsych-survey-text.js');
});

describe('standard use of function as parameter', function(){
  test('function value is used as parameter', function(){
    var trial = {
      type: 'html-keyboard-response',
      stimulus: function(){
        return 'foo'
      }
    }

    jsPsych.init({
      timeline: [trial]
    })

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey(32);
  });

  test('function evaluates at runtime', function(){
    var x = 'foo';

    var trial = {
      type: 'html-keyboard-response',
      stimulus: function(){
        return x;
      }
    }

    x = 'bar';

    jsPsych.init({
      timeline: [trial]
    })

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey(32);
  })
})

describe('data as function', function(){
  test('entire data object can be function', function(){
         
    var trial = {
      type: 'html-keyboard-response',
      stimulus: 'foo',
      data: function(){
        return {x:1}
      }
    }

    jsPsych.init({
      timeline: [trial]
    })

    utils.pressKey(32);
    expect(jsPsych.data.get().values()[0].x).toBe(1)    
  })

  test('single parameter of data object can be function', function(){
         
    var trial = {
      type: 'html-keyboard-response',
      stimulus: 'foo',
      data: {
        x: function() { return 1; }
      }
    }

    jsPsych.init({
      timeline: [trial]
    })

    utils.pressKey(32);
    expect(jsPsych.data.get().values()[0].x).toBe(1)    
  })
})

describe('nested parameters as functions', function(){
  

  test('entire parameter can be a function', function(){
   
    var trial = {
			type: 'survey-text',
			questions: function(){
        return [{prompt: "How old are you?"}, {prompt: "Where were you born?"}]
      }
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().querySelectorAll('p.jspsych-survey-text').length).toBe(2);
		
		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  })

  test('nested parameter can be a function', function(){
   
    var trial = {
			type: 'survey-text',
			questions: [{prompt: function(){ return "foo"; }}, {prompt: "bar"}]
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(document.querySelector('#jspsych-survey-text-0 p.jspsych-survey-text').innerHTML).toBe('foo');
		
		utils.clickTarget(document.querySelector('#jspsych-survey-text-next'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  })
})