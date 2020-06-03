const utils = require('../testing-utils.js');

beforeEach(function(){
    require('../../jspsych.js');
    require('../../plugins/jspsych-html-keyboard-response');
});

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