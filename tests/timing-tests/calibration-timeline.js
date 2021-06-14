var calibration = {
  timeline: [{
    type: 'html-keyboard-response',
    stimulus: `<div style="width:200px; height: 200px; background: white;"></div>`,
      trial_duration: 200,
      post_trial_gap: 100
  }],
  loop_function: function(data){
    if(data.values()[0].response == ' '){
      return false;
    } else {
      return true;
    }
  }
}