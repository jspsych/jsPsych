/*
*  This file defines functions that are used as atomic, shared parts of experiments
*  but are composed of multiple plugins arranged into a pre determined timeline.
*/
var jsPsychUtils = {

    get_attention_check: function() {
        let question_1 = {
            type: 'html-button-response',
            choices: ["<5 years", "5-15 years", "15-25 years", "25+ years"],
            stimulus: "<p id='inst-justified'>According to Wikipedia, Memory is the faculty of the brain, " +
                    "by which data or information is encoded, stored, and retrieved " + 
                    "when needed. It is the retention of information over time for " + 
                    "not be remembered, it would be impossible for language, " +
                    "relationships, or personal identity to develop. Please answer " +
                    "the question below honestly, but for the question on the next " +
                    "page, pick 'never.' Psychologists most generally classify memory " +
                    "as Declarative or Implicit, where Declarative memories " +
                    "include memories for people, places, and events in our lives. " +
                    "It is this type of memory that is most often intended when " +
                    "speaking about memory.<p><p id='inst'>How old is your oldest memory</p>",
        };

        let question_2 = {
            type: 'html-button-response',
            choices: ["Never", "Daily", "Weekly", "Monthly"],
            stimulus: "<p id='inst'>How often do you realize you've forgotten something?</p>"
        };

        // TODO: ask them to return the HIT due to failed attention check
        let check_failed = {
            type: 'html-keyboard-response',
            response_ends_trial: false,
            stimulus: "<p id='inst'>The preceding questions were designed to screen participants who are not carefully following the instructions of our study.<p>" +
                    "<p id='inst'>Based on your responses to these questions, we ask that you return this HIT to MTurk at this time.</p>"
        }

        let check_failed_node = {
            timeline: [check_failed],
            conditional_function: function(){
                // get the data from the previous trial,
                // and check which key was pressed
                var data = jsPsych.data.get().last(1).values()[0];
                if(data.button_pressed == 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        return { timeline: [question_1, question_2, check_failed_node] };
    },

    get_audio_test: function() {

    }
}
