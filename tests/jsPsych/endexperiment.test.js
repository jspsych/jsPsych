const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import '../../plugins/jspsych-html-keyboard-response.js';

// beforeEach(function(){
//     require('../../jspsych.js');
//     require('../../plugins/jspsych-html-keyboard-response');
// });

test('works on basic timeline', function(){
    var timeline = [
        {
            type: 'html-keyboard-response',
            stimulus: 'trial 1',
            on_finish: function(){
                jsPsych.endExperiment('the end');
            }
        },
        {
            type: 'html-keyboard-response',
            stimulus: 'trial 2'
        }
    ]

    jsPsych.init({timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('trial 1');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('the end');
});

test('works with looping timeline (#541)', function(){
    var timeline = [
        {
            timeline: [{type: 'html-keyboard-response', stimulus: 'trial 1'}],
            loop_function: function(){
                jsPsych.endExperiment('the end')
            }
        }
    ]

    jsPsych.init({timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('trial 1');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('the end');
});

test('works with object as trial type', function(){
    var timeline = [
        {
            type: {
                info: {
                    name: 'test-plugin',
                    parameters: {
                        stimulus: {
                            type: jsPsych.plugins.parameterType.STRING,
                            default: undefined
                        }
                    }
                },
                trial: function(display_element, trial) {
                    display_element.innerHTML = trial.stimulus

                    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                        callback_function: function () {
                            var data = {};
                            jsPsych.finishTrial(data);

                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                        },
                        rt_method: 'performance',
                        persist: false,
                        allow_held_key: false
                    })
                  }
            },
            stimulus: 'test trial',
            on_finish: function(){ jsPsych.endExperiment('the end') }
        }
    ]

    jsPsych.init({timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('test trial');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('the end');
});

test('works with object as trial type', function(){
    var timeline = [
        {
            type: {
                info: {
                    name: 'test-plugin',
                    parameters: {
                        stimulus: {
                            type: jsPsych.plugins.parameterType.STRING,
                            default: undefined
                        }
                    }
                },
                trial: function(display_element, trial) {
                    display_element.innerHTML = trial.stimulus

                    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                        callback_function: function () {
                            var data = {};
                            jsPsych.finishTrial(data);

                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                        },
                        rt_method: 'performance',
                        persist: false,
                        allow_held_key: false
                    })
                  }
            },
            stimulus: 'test trial',
            on_finish: function(){ jsPsych.endExperiment('the end') }
        }
    ]

    jsPsych.init({timeline});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('test trial');

    utils.pressKey(32);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('the end');
}); 