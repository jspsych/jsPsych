<!doctype html>
<html>
    
    <head>
        <title>My experiment</title>
        <!-- Load jQuery -->
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <!-- Load the jspsych library and plugins -->
        <script src="scripts/jspsych.js"></script>
        <script src="scripts/plugins/jspsych-text.js"></script>
        <script src="scripts/plugins/jspsych-single-stim.js"></script>
        <!-- Load the stylesheet -->
        <link href="experiment.css" type="text/css" rel="stylesheet"></link>
    </head>
    
    <body>
        <div id="jspsych_target"></div>
    </body>
    
    <script type="text/javascript">
        // Experiment parameters
        var n_trials = 20;
        var stimuli = ["img/congruent_left.gif", "img/congruent_right.gif", "img/incongruent_left.gif", "img/incongruent_right.gif"];
        var stimuli_types = ["congruent", "congruent", "incongruent", "incongruent"];

        // Experiment Instructions
        var welcome_message = '<div id="instructions"><p>Welcome to the experiment. Press enter to begin.</p></div>';
        
        var instructions = '<div id="instructions"><p>You will see a series of images that look similar to this:</p>\
            <p><img src="img/incongruent_right.gif"></p><p>Press the arrow key that corresponds to the direction that\
            the middle arrow is pointing. For example, in this case you would press the right arrow key.</p>\
            <p>Press enter to start.</p>';

        var debrief = '<div id="instructions"><p>Thank you for participating! Press enter to see the data.</p></div>';

        // Generating Random Order for Stimuli
        var stimuli_random_order = [];
        var opt_data = [];

        for (var i = 0; i < n_trials; i++) {
            var random_choice = Math.floor(Math.random() * stimuli.length);

            stimuli_random_order.push(stimuli[random_choice]);
            opt_data.push({
                "stimulus_type": stimuli_types[random_choice]
            });
        }
        
        // Define experiment blocks
        var instruction_block = {
                type: "text",
                text: [welcome_message, instructions],
                timing_post_trial: 2500
            };
        
        var test_block = {
                type: "single-stim",
                stimuli: stimuli_random_order,
                choices: [37, 39],
                data: opt_data
            };
            
        var debrief_block = {
                type: "text",
                text: [debrief]
            };
            

        jsPsych.init({
            display_element: $('#jspsych_target'),
            experiment_structure: [instruction_block, test_block, debrief_block],
            on_finish: function(data) {
                $("#jspsych_target").append($('<pre>', {
                    html: jsPsych.dataAsCSV()
                }));
                
                jsPsych.saveCSVdata("data.csv");
            }
        });
    </script>
</html>