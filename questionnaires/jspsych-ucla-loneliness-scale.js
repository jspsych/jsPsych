/**
 * jsPsych UCLA Loneliness Scale v3 (4-point Likert)
 *
 * The following script implements the UCLA Loneliness Questionnaire
 * using 20 prompts and a 4-point Likert scale with labels of frequency
 * coded with 1 (Never), 2 (Rarely), 3 (Sometimes), 4 (Often). Along with
 * collecting responses, this script will compute the UCLA Lonliness Scale's 
 * score using the methods by Russel for Version 3 of the questionnaire.
 *
 * Loading:
 *
 * To enable this questionnaire, load this script after loading the plugin
 * called `jspsych-survey-likert`, as in the following:
 *
 * <head>
 *   <script src="../jspsych.js"></script>
 *   <script src="../plugins/jspsych-survey-likert.js"></script>
 *   <script src="../questionnaires/jspsych-ucla-loneliness-scale.js"></script>
 *   <link rel="stylesheet" href="../css/jspsych.css">
 * </head>
 *
 * Usage:
 *
 * To use this questionnaire in your experiment as a trial in the timeline,
 * call the function `buildUCLA` with input parameters `instructions` (required) 
 * and `saveFn` (optional):
 *
 * var instructions = "Please select the option best describing how each prompt makes you feel."
 * var UCLATrial = buildUCLA(instructions)
 * 
 * Then simply include `UCLATrial` as an item in your timeline array.
 *
 */

var labels = [
  "1 - Never",
  "2 - Rarely",
  "3 - Sometimes",
  "4 - Often"
];

var prompts = [
  "I feel in tune with the people around me.", // reverse
  "I lack companionship.",
  "There is no one I can turn to.",
  "I do not feel alone.",
  "I feel part of a group of friends.", // reverse
  "I have a lot in common with the people around me.", // reverse
  "I am no longer close to anyone.",
  "My interests and ideas are not shared by those around me.",
  "I am an outgoing person.", // reverse
  "There are people I feel close to.", // reverse
  "I feel left out.",
  "My social relationships arc superficial.",
  "No one really knows me well.",
  "I feel isolated from others.",
  "I can find companionship when I want it.", // reverse
  "There are people who really understand me.", // reverse
  "I am unhappy being so withdrawn.",
  "People are around me but not with me.",
  "There are people I can talk to.", // reverse
  "There are people I can turn to", // reverse
];

function buildQuestions(prompts, labels) {
  var questions = [];
  prompts.forEach(function(prompt) {
    questions.push({
      prompt: prompt,
      labels: labels,
      required: true,
      isHoritzonal: true
    });
  });
  return questions;
}

function computeScore(data) {
  // parse survey responses
  var res = JSON.parse(data.responses);

  for (var key in res) {
    if (res.hasOwnProperty(key)) {
      res[key] = res[key].toString().replace(/[^0-9,]/g, "").split(",");
    }
  }

  // compute measures
  var items = [];
  // reverse: 0, 4, 5, 8, 9, 14, 15, 18, 19
  var neg = ["Q0", "Q4", "Q5", "Q8", "Q9", "Q14", "Q15", "Q18", "Q19"];
  var pos = ["Q1", "Q2", "Q3", "Q6", "Q7", "Q10", "Q11", "Q12", "Q13", "Q16", "Q17"];
  
  neg.forEach(function(q) {
    if (res[q] > 0) {
      items.push(5 - parseInt(res[q]));
    }
  });
  pos.forEach(function(q) {
    if (res[q] > 0) {
      items.push(parseInt(res[q]));
    }
  })

  var count = 0;
  for (var i = 0; i < items.length; i++) {
    count += items[i];
  }
  var mean = count / items.length;

  return mean;

}

function buildUCLA(instructions, saveFn) {
  return {
    type: 'survey-likert',
    preamble: instructions,
    questions: buildQuestions(prompts, labels),
    on_finish: function(data) {

      var score = computeScore(data);
      
      jsPsych.data.addProperties({
        UCLA: score,
      });

      if (saveFn && {}.toString.call(saveFn) === '[object Function]') saveFn();

    }
  };
};
