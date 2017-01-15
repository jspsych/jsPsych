const root = '../../';

require(root + 'jspsych.js');

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

describe('#cancelKeyboardResponse', function(){
  test('should cancel a keyboard response listener', function(){
    var callback = jest.fn();
    var listener = jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback});
    expect(callback.mock.calls.length).toBe(0);
    jsPsych.pluginAPI.cancelKeyboardResponse(listener);
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe('#cancelAllKeyboardResponses', function(){
  test('should cancel all keyboard response listeners', function(){
    var callback = jest.fn();
    jsPsych.pluginAPI.getKeyboardResponse({callback_function: callback});
    expect(callback.mock.calls.length).toBe(0);
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
    document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 32}));
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe('#convertKeyCharacterToKeyCode', function(){
  test('should return the keyCode for a particular character', function(){
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('q')).toBe(81);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('1')).toBe(49);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space')).toBe(32);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('enter')).toBe(13);
  });
});

describe('#convertKeyCodeToKeyCharacter', function(){
  test('should return the keyCode for a particular character', function(){
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(81)).toBe('q');
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(49)).toBe('1');
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(32)).toBe('space');
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(13)).toBe('enter');
  });
});

describe('#evaluateFunctionParameters', function(){
  test('should convert functions to their return value', function(){
    var trial = {
      p: function() { return 1; }
    }
    jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    expect(trial.p).toBe(1);
  });
  test('should allow protecting functions', function(){
    var trial = {
      p: function() { return 1; }
    }
    jsPsych.pluginAPI.evaluateFunctionParameters(trial, ['p']);
    expect(typeof trial.p).toBe('function');
  });
  test('should always protect on_finish', function(){
    var trial = {
      on_finish: function() { return 1; }
    }
    jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    expect(typeof trial.on_finish).toBe('function');
  });
})

describe('#setTimeout', function(){
  test('basic setTimeout control with centralized storage', function(){
    jest.useFakeTimers();
    var callback = jest.fn();
    jsPsych.pluginAPI.setTimeout(callback, 1000);
    expect(callback).not.toBeCalled();
    jest.runAllTimers();
    expect(callback).toBeCalled();
  })
})

describe('#clearAllTimeouts', function(){
  test('clear timeouts before they execute', function(){
    jest.useFakeTimers();
    var callback = jest.fn();
    jsPsych.pluginAPI.setTimeout(callback, 5000);
    expect(callback).not.toBeCalled();
    jsPsych.pluginAPI.clearAllTimeouts();
    jest.runAllTimers();
    expect(callback).not.toBeCalled();
  })
})
