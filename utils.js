/*
 *  This file defines functions that are used as atomic, shared parts of experiments
 *  but are composed of multiple plugins arranged into a pre determined timeline.
 */
var jsPsychUtils = {

    get_attention_check: function() {
        let question_1 = {
            type: 'html-button-response',
            choices: ["<5 years", "5-15 years", "15-25 years", "25+ years"],
            stimulus: "<p class='inst-justified'>According to Wikipedia, Memory is the faculty of the brain by which data or information is encoded, stored, and retrieved when needed. It is the retention of information over time for the purpose of influencing future action. If past events could not be remembered, it would be impossible for language, relationships, or personal identity to develop. Please answer the question below honestly, but for the next question, pick 'never.' Psychologists most generally classify memory as Declarative or Implicit, where Declarative memories include memories for people, places, and events in our lives. It is this type of memory that is most often intended when speaking about memory.<p>" +
            "<p class='inst'>How old is your oldest memory?</p>",
        };

        let question_2 = {
            type: 'html-button-response',
            choices: ["Never", "Daily", "Weekly", "Monthly"],
            stimulus: "<p class='inst'>How often do you realize you've forgotten something?</p>"
        };

        // TODO: ask them to return the HIT due to failed attention check
        let check_failed = {
            type: 'html-keyboard-response',
            response_ends_trial: false,
            stimulus: "<p class='inst'>The preceding questions were designed to screen participants who are not carefully following the instructions of our study.<p>" +
            "<p class='inst'>Based on your responses to these questions, we ask that you return this HIT to MTurk at this time.</p>"
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

        var audio_test_intro = {
            type: 'instructions',
            pages: ['<div class="inst-justified"><p>Due to the use of auditory stimuli in this task, it is important that you have the volume on your computer turned on and set loud enough to hear the words that we will be presenting. In order to ensure that you will be able to perform the auditory portions of the task, we ask that you begin by completing the following audio test.</p><p>You will see a series of three pages, each containing a play button and an empty textbox. On each page, click the play button to listen to an audio clip of a single word, then enter that word into the textbox to proceed. You will be able to replay the word as many times as needed, giving you the chance to adjust your volume to an appropriate level.</p></div><p class="inst">Press space to begin the audio test.</p>'],
            data: {type: 'audiotest instructions'},
            key_forward: ' ',
            data: {type: "audiotest instructions"}
        };

        var audio_test1 = {
            type:'audio-test',
            preamble: ['<h1>Word 1</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            autoplay: true,
            audio_file: '/static/audio/test1.wav',
            word: 'ocean',
            data: {type: 'audiotest'}
        };

        var audio_test2 = {
            type:'audio-test',
            autoplay: true,
            preamble: ['<h1>Word 2</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            audio_file: '/static/audio/test2.wav',
            word: 'crystal',
            data: {type: 'audiotest'}
        };

        var audio_test3 = {
            type:'audio-test',
            autoplay: true,
            preamble: ['<h1>Word 3</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            audio_file: '/static/audio/test3.wav',
            word: 'spice',
            post_trial_gap: 750,
            data: {type: 'audiotest'}
        };

        return {timeline: [audio_test_intro, audio_test1, audio_test2, audio_test3]}
    }
}
