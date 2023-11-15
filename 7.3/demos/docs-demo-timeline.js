function generateDocsDemoTimeline(timeline, setup_timeline) {
  let setup;
  if (setup_timeline) {
    setup = {
      timeline: setup_timeline,
    };
  }

  const start = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: ["Run demo"],
  };

  let run = 0;

  let trial = {
    timeline: timeline,
    data: {
      run: () => {
        return run;
      },
    },
  };

  const show_data = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p style="margin-bottom:0px; font-weight: bold;">Trial data:</p>
      <pre style="margin-top:0px; text-align:left; font-size:14px; line-height:1.3em;"></pre>`,
    on_load: function () {
      const trial_data = jsPsych.data.get().filter({ run: run }).ignore("run").values();
      const trial_json = JSON.stringify(trial_data, null, 2);
      jsPsych.getDisplayElement().querySelector("pre").innerText = trial_json;
    },
    choices: ["Repeat demo"],
  };

  const trial_loop = {
    timeline: [trial, show_data],
    loop_function: function () {
      run++;
      return true;
    },
  };

  if (setup_timeline) {
    return [setup, start, trial_loop];
  } else {
    return [start, trial_loop];
  }
}
