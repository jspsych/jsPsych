const root = '../../';
const utils = require('../testing-utils.js');

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-survey-text.js');
});

describe('nested defaults', function(){
    test('work in basic situation', function(){
        var t = {
            type: 'survey-text',
            questions: [
                {
                    prompt: 'Question 1.'
                },
                {
                    prompt: 'Question 2.'
                }
            ]
        }

        jsPsych.init({timeline: [t]})

        var display = jsPsych.getDisplayElement();

        expect(display.querySelector('input').placeholder).toBe("")
        expect(display.querySelector('input').size).toBe(40)
    });

    test('safe against extending the array.prototype (issue #989)', function(){
        Array.prototype.qq = jest.fn();
        const spy = jest.spyOn(console, 'error').mockImplementation();

        var t = {
            type: 'survey-text',
            questions: [
                {
                    prompt: 'Question 1.'
                },
                {
                    prompt: 'Question 2.'
                }
            ]
        }

        jsPsych.init({timeline: [t]})

        var display = jsPsych.getDisplayElement();

        expect(display.querySelector('input').placeholder).toBe("")
        expect(display.querySelector('input').size).toBe(40)

        expect(spy).not.toHaveBeenCalled();

        spy.mockRestore();
    });
})