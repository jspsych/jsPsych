const root = '../../';

jest.useFakeTimers();

describe('iat-image plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-iat-image.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['iat-image']).not.toBe('undefined');
  });

  test('displays image by default', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      response_ends_trial: true,
      display_feedback: false,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      trial_duration: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(/blue.png/);

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('display should only clear when left key is pressed', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      left_category_key: 'f',
      left_category_label: ['FRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="../media/blue.png" id="jspsych-iat-stim">');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('display should only clear when right key is pressed', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      right_category_key: 'j',
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'right',
      key_to_move_forward: ['j']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\">'));

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 74}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 74}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('display should clear when any key is pressed', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'right',
      key_to_move_forward: [jsPsych.ALL_KEYS]
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\" class=\" responded\">'));

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('display should clear only when "other key" is pressed', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['other key']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 74}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 74}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\" class=\" responded\">'));

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });


  test('labels should be with assigned key characters', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p>Press j for:<br> <b>UNFRIENDLY</b>'));
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p>Press f for:<br> <b>FRIENDLY</b>'));

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode:70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode:70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('should display wrong image when wrong key is pressed', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
      display_feedback: true,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: [jsPsych.ALL_KEYS],
      response_ends_trial: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().querySelector('#wrongImgContainer').style.visibility).toBe('hidden');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode:74}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode:74}));

    expect(jsPsych.getDisplayElement().querySelector('#wrongImgContainer').style.visibility).toBe('visible');

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('trial_duration should end trial after time has elapsed; only if display_feedback is false', function(){

    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      display_feedback: false,
      response_ends_trial: false,
      trial_duration: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\">'));

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    var trial = {
      type: 'iat-image',
      stimulus: '../media/blue.png',
      response_ends_trial: false,
      display_feedback: false,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      trial_duration: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\" class=\" responded\">'));

    jest.runAllTimers();
  });

  test('should accept functions as parameters(trial_duration in use, response ends trial false)', function(){

    var trial = {
      type: 'iat-image',
      stimulus: function(){ return '../media/blue.png'; },
      display_feedback: function(){ return true; },
      html_when_wrong: function(){ return '<span style="color: red; font-size: 80px">X</span>'; },
      left_category_key: function(){ return 'e'; },
      right_category_key: function(){ return 'i'; },
      left_category_label: function(){return ['FRIENDLY']; },
      right_category_label: function(){return ['UNFRIENDLY']; },
      stim_key_association: function(){return 'left'; },
      trial_duration: function(){ return 1000; },
      response_ends_trial: function(){ return false; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src="../media/blue.png" id=\"jspsych-iat-stim\">'));

    jest.runTimersToTime(500);

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 73}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 73}));

    expect(jsPsych.getDisplayElement().querySelector('#wrongImgContainer').style.visibility).toBe('visible');

    jest.runTimersToTime(1100);

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('should accept functions as parameters(trial_duration is not in use)', function(){

    var trial = {
      type: 'iat-image',
      stimulus: function(){ return '../media/blue.png'; },
      display_feedback: function(){ return true; },
      html_when_wrong: function(){ return '<span style="color: red; font-size: 80px">X</span>'; },
      left_category_key: function(){ return 'e'; },
      right_category_key: function(){ return 'i'; },
      left_category_label: function(){return ['FRIENDLY']; },
      right_category_label: function(){return ['UNFRIENDLY']; },
      stim_key_association: function(){return 'left'; },
      key_to_move_forward: function(){return [jsPsych.ALL_KEYS]; },
      trial_duration: function(){ return 1000; },
      response_ends_trial: function(){ return true; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src="../media/blue.png" id=\"jspsych-iat-stim\">'));

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 73}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 73}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\" class=\" responded\">'));

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"../media/blue.png\" id=\"jspsych-iat-stim\" class=\" responded\">'));

    jest.runTimersToTime(1500);

    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: 69}));
    document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: 69}));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
