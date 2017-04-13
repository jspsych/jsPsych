const root = '../../';

jest.useFakeTimers();

describe('iat plugin', function(){

  beforeEach(function(){
    require(root + 'jspsych.js');
    require(root + 'plugins/jspsych-iat.js');
  });

  test('loads correctly', function(){
    expect(typeof window.jsPsych.plugins['iat']).not.toBe('undefined');
  });

  test('displays image by default', function(){
    var trial = {
      type: 'iat',
      stimulus: '../media/blue.png'
    }

    jsPsych.init({
      timeline: [trial]
    });


    expect(jsPsych.getDisplayElement.innerHTML).toMatchSnapshot();
  });

  test('displays html when is_html is true', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });

  test('display should only clear when left key is pressed', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      left_category_key: 'f',
      left_category_label: ['FRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });

  test('display should only clear when right key is pressed', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      right_category_key: 'j',
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'right',
      key_to_move_forward: ['j']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 74}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 74}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

  });

  test('display should clear when any key is pressed', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      right_category_key: 'j',
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'right',
      key_to_move_forward: [jsPsych.ALL_KEYS]
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

  });

  test('display should only when "other key" is pressed', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
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

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 74}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 74}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

  });


  test('display should clear if key press is associated with category label', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left'
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode:70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });

  test('should display wrong image when wrong key is pressed', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      image_when_wrong: '../media/redX.png',
      wrong_image_name: 'red X',
      is_html: true,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:74}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode:74}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });

  test('when wrong image is displayed, display should clear after pressing key to move forward', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      image_when_wrong: '../media/redX.png',
      wrong_image_name: 'red X',
      is_html: true,
      left_category_key: 'f',
      right_category_key: 'j',
      left_category_label: ['FRIENDLY'],
      right_category_label: ['UNFRIENDLY'],
      stim_key_association: 'left',
      key_to_move_forward: ['f']
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:74}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode:74}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode:70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });


  test('prompt should append html below stimulus', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      prompt: '<div id="foo">this is the prompt</div>'
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

  });

  test('timing_response should end trial after time has elapsed; only if display_feedback is false', function(){

    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      display_feedback: false,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

  });

  test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    var trial = {
      type: 'iat',
      stimulus: '<p>hello</p>',
      is_html: true,
      response_ends_trial: false,
      display_feedback: false,
      timing_response: 500
    }

    jsPsych.init({
      timeline: [trial]
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runAllTimers();
  });

  test('should accept functions as parameters(timing_response in use)', function(){

    var trial = {
      type: 'iat',
      stimulus: function(){ return '<p>hello</p>'; },
      is_html: function(){ return true; },
      display_feedback: function(){ return false; },
      image_when_wrong: function(){ return '../media/redX.png'; },
      wrong_image_name: function(){return 'red X'; },
      left_category_key: function(){ return 'E'; },
      right_category_key: function(){ return 'I'; },
      left_category_label: function(){return ['FRIENDLY']; },
      right_category_label: function(){return ['UNFRIENDLY']; },
      stim_key_association: function(){return 'left'; },
      prompt: function(){ return '<div>prompt</div>'; },
      timing_response: function(){ return 1000; },
      response_ends_trial: function(){ return false; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runTimersToTime(500);

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });

  test('should accept functions as parameters(timing_response is not in use)', function(){

    var trial = {
      type: 'iat',
      stimulus: function(){ return '<p>hello</p>'; },
      is_html: function(){ return true; },
      display_feedback: function(){ return true; },
      image_when_wrong: function(){ return '../media/redX.png'; },
      wrong_image_name: function(){return 'red X'; },
      left_category_key: function(){ return 'E'; },
      right_category_key: function(){ return 'I'; },
      left_category_label: function(){return ['FRIENDLY']; },
      right_category_label: function(){return ['UNFRIENDLY']; },
      stim_key_association: function(){return 'left'; },
      key_to_move_forward: function(){return ['other key']; },
      prompt: function(){ return '<div>prompt</div>'; },
      timing_response: function(){ return 1000; },
      response_ends_trial: function(){ return false; }
    }

    jsPsych.init({
      timeline: [trial]
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 70}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 70}));

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runTimersToTime(500);

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();

    jest.runTimersToTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toMatchSnapshot();
  });
});