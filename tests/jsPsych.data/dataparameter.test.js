const root = '../../';
const utils = require('../testing-utils.js');

describe('The data parameter', function(){
  test('should record data to a trial', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var trial = {
        type: 'html-keyboard-response',
        stimulus: 'hello',
        data: {added: true},
      }

      jsPsych.init({
        timeline: [trial],
        on_finish: function() {
          var d = jsPsych.data.get().values()[0].added;
          resolve(d);
        }
      });

      utils.pressKey(32);

      //resolve();
    })).then(function(data) { expect(data).toBe(true) });
  });

  test('should record data to all nested trials', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var trial = {
        type: 'html-keyboard-response',
        timeline: [
          {stimulus: 'a'},
          {stimulus: 'b'}
        ],
        data: {added: true},
      }

      jsPsych.init({
        timeline: [trial],
        on_finish: function() {
          var d = jsPsych.data.get().filter({added: true}).count();
          resolve(d);
        }
      });

      utils.pressKey(32);

      utils.pressKey(32);

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });

  test('should record data to all nested trials with timeline variables', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var vars = [
        {stimulus: 'a'},
        {stimulus: 'b'}
      ];

      var trial = {
        timeline: [
          {type: 'html-keyboard-response', 
          stimulus: jsPsych.timelineVariable('stimulus')}
        ],
        timeline_variables: vars,
        data: {added: true},
      }

      jsPsych.init({
        timeline: [trial],
        on_finish: function() {
          var d = jsPsych.data.get().filter({added: true}).count();
          resolve(d);
        }
      });

      utils.pressKey(32);

      utils.pressKey(32);

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });

  test.skip('should record data to all nested trials with timeline variables even when nested trials have own data', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-html-keyboard-response.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var vars = [
        {stimulus: 'a'},
        {stimulus: 'b'}
      ];

      var trial = {
        timeline: [
          {
            type: 'html-keyboard-response',
            stimulus: jsPsych.timelineVariable('stimulus'),
            data: {foo: 1}
          }
        ],
        timeline_variables: vars,
        data: {added: true},
      }

      jsPsych.init({
        timeline: [trial],
        on_finish: function() {
          var d = jsPsych.data.get().filter({added: true}).count();
          resolve(d);
        }
      });

      utils.pressKey(32);

      utils.pressKey(32);

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });
});
