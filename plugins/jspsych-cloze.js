/** 
 * Simple Cloze
 */

jsPsych.plugins['cloze'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'cloze',
        description: '',
        parameters: {
            text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Cloze text',
                default: undefined,
                description: 'Cloze text with %input to check% (surrounded by percentage signs)'
            },
            allow_mistakes: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Allow mistakes',
                default: true,
                description: 'Allow finishing the trial while answers are not correct'
            },
            mistake_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Mistake function',
                default: function () {},
                description: 'Function called in case of wrong answers and if allow_mistakes is set to TRUE'
            },
            button_text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button text',
                default: 'OK',
                description: 'The text of the button to finish the trial'
            },
        }
    };

    plugin.trial = function (display_element, trial) {

    

        html = '<div class="cloze">';
        elements = trial.text.split('%');
        solutions = [];
        for (i=0; i<elements.length; i++)
        {
            if (i%2 === 0)
            {
                html += elements[i];
            }
            else
            {
                solutions.push(elements[i].trim());
                html += '<input type="text" id="input'+(solutions.length-1)+'" value="">';
            }
        }
        html += '</div>';
        
        display_element.innerHTML = html;
        
        attempts = [];
      
      
        
      
        var check = function() {

            answers_correct = true;
            attempts.push([]);
            for (i=0; i<solutions.length; i++)
            {
                field = document.getElementById('input'+i);
                answer = field.value.trim();
                //answer = field.val().trim();
                attempts[attempts.length-1].push(answer);
                
                if (answer.toLowerCase() !== solutions[i].toLowerCase())
                {
                    field.style.color = 'red';
                    answers_correct = false;
                }
                else
                {
                    field.style.color = 'black';
                }
            }   
            
            var trial_data = {
                'solution' : solutions,
                'attempts' : attempts,
                'answer_correct' : answers_correct
            };
            

            if(trial.allow_mistakes)
            {
                display_element.innerHTML = '';
                jsPsych.finishTrial(trial_data); 
            }
            else
            {
                if(answers_correct)
                {
                    display_element.innerHTML = '';
                    jsPsych.finishTrial(trial_data); 
                }
            else
                {
                    trial.mistake_fn();
                }
            }

            
            
        };
        
        display_element.innerHTML += '<br><button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">'+trial.button_text+'</button>';
        
        display_element.querySelector('#finish_cloze_button').addEventListener('click', check);
    };

    return plugin;
})();
