/*
*  This file defines functions that are used as atomic, shared parts of experiments
*  but are composed of multiple plugins arranged into a pre determined timeline.
*/

function get_attention_check() {
    let question_1 = {
        type: 'html-button-response',
        choices: ["<5 years", "5-15 years", "15-25 years", "25+ years"],
        stimulus: "<p id='inst'>According to Wikipedia, Memory is the faculty of the brain, " +
                  "by which data or information is encoded, stored, and retrieved " + 
                  "when needed. It is the retention of information over time for " + 
                  "not be remembered, it would be impossible for language, " +
                  "relationships, or personal identity to develop. Please answer " +
                  "the question below honestly, but for the question on the next " +
                  "page, pick 'never.' Psychologists most generally classify memory " +
                  "as Declarative or Implicit, where Declarative memories " +
                  "include memories for people, places, and events in our lives. " +
                  "It is this type of memory that is most often intended when " +
                  "speaking about memory.<p>",
        prompt: "How old is your oldest memory?"
    };

    let question_2 = {
        type: 'html-button-response',
        choices: ["Never", "Daily", "Weekly", "Monthly"],
        prompt: "How often do you realize you've forgotten something?"
    };

    // TODO: ask them to return the HIT due to failed attention check

    return {timeline: [question_1, question_2],
            }
}

function get_audio_test() {

}