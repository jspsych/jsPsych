const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('iat-html plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-iat-html.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['iat-html']).not.toBe('undefined');
  });

  test('displays image by default', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>dogs</p>',
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

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<p id=\"jspsych-iat-stim\"></p><p>dogs</p><p></p>');

    utils.pressKey('f');

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('display should only clear when left key is pressed', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
      left_category_key: 'f',
      left_category_label: ['FRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(' ');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<p id=\"jspsych-iat-stim\"></p><p>hello</p><p></p>');

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('display should only clear when right key is pressed', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
      right_category_key: 'j',
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'right',
      key_to_move_forward: ['j']
    }

    jsPsych.init({
      timeline: [trial]
    });

    utils.pressKey(' ');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\"></p><p>hello</p><p></p>'));

    utils.pressKey('j');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('display should clear when any key is pressed', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
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

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\" class=\" responded\"></p><p>hello</p>'));

    utils.pressKey(' ');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('display should clear only when "other key" is pressed', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
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

    utils.pressKey('j');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\" class=\" responded\"></p><p>hello</p>'));

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });


  test('labels should be with assigned key characters', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
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

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('should display wrong image when wrong key is pressed', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
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

    utils.pressKey('j');
    expect(jsPsych.getDisplayElement().querySelector('#wrongImgContainer').style.visibility).toBe('visible');

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('trial duration should end trial after time has elapsed; only if display_feedback is false', function(){

    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
      display_feedback: false,
      response_ends_trial: false,
      trial_duration: 500,
      stim_key_association: 'left'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\"></p><p>hello</p>'));

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

  });

  test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    var trial = {
      type: 'iat-html',
      stimulus: '<p>hello</p>',
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

    utils.pressKey('f');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\" class=\" responded\"></p><p>hello</p>'));

    jest.runAllTimers();
  });

  test('should accept functions as parameters(trial_duration in use, response ends trial false)', function(){

    var trial = {
      type: 'iat-html',
      stimulus: function(){ return '<p>hello</p>'; },
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

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\"></p><p>hello</p><p></p>'));

    jest.runTimersToTime(500);

    utils.pressKey('i');
    expect(jsPsych.getDisplayElement().querySelector('#wrongImgContainer').style.visibility).toBe('visible');

    jest.runTimersToTime(1100);

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('should accept functions as parameters(trial_duration is not in use)', function(){

    var trial = {
      type: 'iat-html',
      stimulus: function(){ return '<p>hello</p>'; },
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

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\"></p><p>hello</p>'));

    utils.pressKey('i');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\" class=\" responded\"></p><p>hello</p>'));

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p id=\"jspsych-iat-stim\" class=\" responded\"></p><p>hello</p>'));

    jest.runTimersToTime(1500);

    utils.pressKey('e');
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
