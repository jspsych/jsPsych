const root = '../../';

require(root + 'jspsych.js');

require(root + 'plugins/jspsych-text.js');

describe('Data recording', function(){

  xtest('record focus events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  })

  xtest('record blur events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  })

  xtest('record fullscreenenter events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  })

  xtest('record fullscreenexit events', function(){
    var timeline = [
      {type: 'text', text:'hello'}
    ];
    jsPsych.init({timeline:timeline});
    // click through first trial
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    // check if data contains rt
  })

})

describe('on_interaction_data_update', function(){
  xtest('fires for blur', function(){

  });

  xtest('fires for focus', function(){

  })

  xtest('fires for fullscreenexit', function(){

  })

  xtest('fires for fullscreenenter', function(){

  })
})
