require('../jspsych.js');

describe('#getKeyboardResponse', function(){
  test('should execute a function after successful keypress', function(){
    var callback = jest.fn();
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback});
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(1);
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(1);
  });
  test('should execute only valid keys', function(){
    var callback = jest.fn();
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback, valid_responses: [13]});
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 54}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 54}));
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 13}));
    expect(callback.mock.calls.length).toBe(1);
  });
  test('should not respond when jsPsych.NO_KEYS is used', function(){
    var callback = jest.fn();
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback, valid_responses: jsPsych.NO_KEYS});
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 54}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 54}));
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(0);
  });
  test('should not respond to held keys when allow_held_key is false', function(){
    var callback = jest.fn();
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback, valid_responses: jsPsych.ALL_KEYS, allow_held_key: false});
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(1);
  });
  test('should respond to held keys when allow_held_key is true', function(){
    var callback = jest.fn();
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback, valid_responses: jsPsych.ALL_KEYS, allow_held_key: true});
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(1);
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
  });
})
