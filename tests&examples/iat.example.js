var iat_right_trial = {
  type: "iat",
  stimulus: "Stim",
  left_prompt: "Left Prompt",
  right_prompt: "Right Prompt",
  category: "<span style='color: blue'>Blue</span>",
  pairing: "right"
}

var iat_left_trial = {
  type: "iat",
  choices: ["v", "b"],
  stimulus: "Stim 2",
  left_prompt: "New Left",
  right_prompt: "New Right",
  stimulus_is_image: false,
  category: "<span style='color: red'>Red</span>",
  pairing: "Left"
}

var iat_img_trial = {
  type: "iat",
  choices: ["f", "j"],
  stimulus: "img/orange.png",
  stimulus_is_image: true,
  left_prompt: "New Left",
  right_prompt: "New Right",
  category: "<span style='color: orange'>Orange</span>",
  pairing: "Left"
};

var test_block = {
  type: "iat",
  category: "GOOD",
  timeline: [
    { stimulus: "ABC",
      stimulus_is_image: false,
      pairing: "left"
    },
    {
      stimulus: "img/orange.png",
      stimulus_is_image: true,
      pairing: "right"
    }
  ]
};

jsPsych.init({
  timeline:[iat_right_trial, iat_left_trial, iat_img_trial, test_block],
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
