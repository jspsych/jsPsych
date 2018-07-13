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
                description: 'Cloze text with %input to check%'
            },
            mistake_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Mistake function',
                default: function () {},
                description: 'Function called in case of wrong answers'
            }
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
                html += '<input type="text" id="input'+(solutions.length-1)+'" value="" placeholder="?">';
            }
        }
        html += '</div>';
        
        display_element.innerHTML = html;
        
        attempts = [];
      
      
        
      
        var check = function() {

            answersCorrect = true;
            attempts.push([]);
            for (i=0; i<solutions.length; i++)
            {
                field = $('#input'+i);
                answer = field.val().trim();
                attempts[attempts.length-1].push(answer);
                
                if (answer.toLowerCase() !== solutions[i].toLowerCase())
                {
                    field.css('color', 'red');
                    answersCorrect = false;
                }
                else
                {
                    field.css('color', 'black');
                }
            }   
            
            var trial_data = {
                'solution' : solutions,
                'attempts' : attempts
            };
            
            if(answersCorrect)
            {
                display_element.innerHTML = '';
                jsPsych.finishTrial(trial_data); 
            }
            else
            {
                trial.mistake_fn();
            }
            
        };
        
        display_element.innerHTML += '<br><button class="navbutton" type="button" id="finishcloze">OK</button>';
        
        display_element.querySelector('#finishcloze').addEventListener('click', check);
    };

    return plugin;
})();
