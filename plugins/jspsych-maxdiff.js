/**
 * jspsych-maxdiff
 * Angus Hughes
 * 
 * a jspsych plugin for maxdiff/conjoint analysis designs
 *
 */

jsPsych.plugins['maxdiff'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'maxdiff',
        description: '',
        parameters: {
            alternatives: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Alternatives',
                array: true,
                default: undefined,
                description: 'Alternatives presented in the Maxdiff table.'
            },
            labels: {
                type: jsPsych.plugins.parameterType.STRING,
                array: true,
                pretty_name: 'Labels',
                default: undefined,
                description: 'Labels to display for most or least preferred.'
            },
            randomize_alternative_order: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Randomize alternative Order',
                default: false,
                description: 'If true, the order of the alternatives will be randomized'
            },
            preamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: '',
                description: 'String to display at top of the page.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Continue',
                description: 'Label of the button.'
            },
            required: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Required',
                default: false,
                description: 'Makes answering the alternative required.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {

        // Set some trial parameters
        const most_least = ["most", "least"]
        var enable_submit = trial.required == true ? 'disabled = "disabled"' : '';

        var html = "";
        // inject CSS for trial
        html += '<style id="jspsych-maxdiff-css">';
        html += ".jspsych-maxdiff-statement {display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px;}" +
        'table.jspsych-maxdiff-table {border-collapse: collapse; padding: 15px; margin-left: auto; margin-right: auto;}' + 
        'table.jspsych-maxdiff-table td, th {border-bottom: 1px solid #dddddd; text-align: center; padding: 8px;}' + 
        'table.jspsych-maxdiff-table tr:nth-child(even) {background-color: #dddddd;}';
        html += '</style>';

        // show preamble text
        if (trial.preamble !== null) {
            html += '<div id="jspsych-maxdiff-preamble" class="jspsych-maxdiff-preamble">' + trial.preamble + '</div>';
        }
        html += '<form id="jspsych-maxdiff-form">';

        // add maxdiff options ///
        // first generate alternative order, randomized here as opposed to randomizing the order of alternatives
        // so that the data are always associated with the same alternative regardless of order.
        var alternative_order = [];
        for (var i = 0; i < trial.alternatives.length; i++) {
            alternative_order.push(i);
        }
        if (trial.randomize_alternative_order) {
            alternative_order = jsPsych.randomization.shuffle(alternative_order);
        }

        // Start with column headings
        var maxdiff_table = '<table class="jspsych-maxdiff-table"><tr><th>' + trial.labels[0] + '</th><th></th><th>' + trial.labels[1] + '</th></tr>';

        // construct each row of the maxdiff table
        for (var i = 0; i < trial.alternatives.length; i++) {
            var alternative = trial.alternatives[alternative_order[i]];
            // add alternative
            maxdiff_table += '<tr><td><input class= "jspsych-maxdiff-alt-' + i.toString() + '" type="radio" name="most" data-name = ' + alternative_order[i].toString() + ' /><br></td>';
            maxdiff_table += '<td>' + alternative + '</td>';
            maxdiff_table += '<td><input class= "jspsych-maxdiff-alt-' + i.toString() + '" type="radio" name="least" data-name = ' + alternative_order[i].toString() + ' /><br></td></tr>';
        }
        maxdiff_table += '</table><br><br>';
        html += maxdiff_table;

        // add submit button
        html += '<input type="submit" id="jspsych-maxdiff-next" class="jspsych-maxdiff jspsych-btn" ' + enable_submit + ' value="' + trial.button_label + '"></input>';
        html += '</form>';

        display_element.innerHTML = html;

        // function to control responses
        // first checks that the same alternative cannot be endorsed as 'most' and 'least' simultaneously.
        // then enables the submit button if the trial is required.
        most_least.forEach(function(p) {
            // Get all elements either 'most' or 'least'
            document.getElementsByName(p).forEach(function(alt) {
                alt.addEventListener('click', function() {
                    // Find the opposite (if most, then least & vice versa) identified by the class (jspsych-maxdiff-alt-1, 2, etc)
                    var op = alt.name == 'most' ? 'least' : 'most';
                    var n = document.getElementsByClassName(alt.className).namedItem(op);
                    // If it's checked, uncheck it.
                    if (n.checked) {
                        n.checked = false;
                    }

                    // check response
                    if (trial.required){
                        // Now check if one of both most and least have been enabled to allow submission
                        var most_checked = [...document.getElementsByName('most')].some(c => c.checked);
                        var least_checked = [...document.getElementsByName('least')].some(c => c.checked);
                        if (most_checked && least_checked) {
                            document.getElementById("jspsych-maxdiff-next").disabled = false;
                        } else {
                            document.getElementById("jspsych-maxdiff-next").disabled = true;
                        }
                    }
                });
            });
        });

        // Get the data once the submit button is clicked
        display_element.querySelector('#jspsych-maxdiff-form').addEventListener('submit', function(e){
            e.preventDefault();
            
            // measure response time
            var endTime = performance.now();
            var response_time = endTime - startTime;

            // get the alternative number by the data-name attribute
            var most = parseInt(display_element.querySelectorAll('[name="most"]:checked')[0].getAttribute('data-name'));
            var least = parseInt(display_element.querySelectorAll('[name="least"]:checked')[0].getAttribute('data-name'));

        // data saving
        var trial_data = {
            "rt": response_time,
            "most": trial.alternatives[most],
            "least": trial.alternatives[least]
        };

        // next trial
        jsPsych.finishTrial(trial_data);
        });

        var startTime = performance.now();
    };

    return plugin;
})();