const root = '../../';

describe('The data parameter', function(){
  test('should record data to a trial', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var trial = {
        type: 'text',
        text: 'hello',
        data: {added: true},
      }

      jsPsych.init({
        timeline: [trial],
        on_finish: function() {
          var d = jsPsych.data.get().values()[0].added;
          resolve(d);
        }
      });

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      //resolve();
    })).then(function(data) { expect(data).toBe(true) });
  });

  test('should record data to all nested trials', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var trial = {
        type: 'text',
        timeline: [
          {text: 'a'},
          {text: 'b'}
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

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });

  test('should record data to all nested trials with timeline variables', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var vars = [
        {text: 'a'},
        {text: 'b'}
      ];

      var trial = {
        timeline: [
          {type: 'text', text: jsPsych.timelineVariable('text')}
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

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });

  test.skip('should record data to all nested trials with timeline variables even when nested trials have own data', function(){

    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-text.js');

    return (new Promise(function(resolve, reject){

      var key_data = null;

      var vars = [
        {text: 'a'},
        {text: 'b'}
      ];

      var trial = {
        timeline: [
          {
            type: 'text',
            text: jsPsych.timelineVariable('text'),
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

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
      document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

      //resolve();
    })).then(function(data) { expect(data).toBe(2) });
  });
});
