'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "external-html",
  version,
  parameters: {
    /** The URL of the page to display. */
    url: {
      type: jspsych.ParameterType.STRING,
      default: void 0
    },
    /** The key character the participant can use to advance to the next trial. If left as null, then the participant will not be able to advance trials using the keyboard. */
    cont_key: {
      type: jspsych.ParameterType.KEY,
      default: null
    },
    /** The ID of a clickable element on the page. When the element is clicked, the trial will advance. */
    cont_btn: {
      type: jspsych.ParameterType.STRING,
      default: null
    },
    /** `function(){ return true; }` | This function is called with the jsPsych `display_element` as the only argument when the participant attempts to advance the trial. The trial will only advance if the function return `true`. This can be used to verify that the participant has correctly filled out a form before continuing, for example. */
    check_fn: {
      type: jspsych.ParameterType.FUNCTION,
      default: () => true
    },
    /** If `true`, then the plugin will avoid using the cached version of the HTML page to load if one exists. */
    force_refresh: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** If `true`, then scripts on the remote page will be executed. */
    execute_script: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "Execute scripts",
      default: false
    }
  },
  data: {
    /** The url of the page. */
    url: {
      type: jspsych.ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to finish the trial. */
    rt: {
      type: jspsych.ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class ExternalHtmlPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial, on_load) {
    let trial_complete;
    var url = trial.url;
    if (trial.force_refresh) {
      url = trial.url + "?t=" + performance.now();
    }
    fetch(url).then((response) => {
      return response.text();
    }).then((html) => {
      display_element.innerHTML = html;
      on_load();
      var t0 = performance.now();
      const key_listener = (e) => {
        if (this.jsPsych.pluginAPI.compareKeys(e.key, trial.cont_key)) {
          finish();
        }
      };
      const finish = () => {
        if (trial.check_fn && !trial.check_fn(display_element)) {
          return;
        }
        if (trial.cont_key) {
          display_element.removeEventListener("keydown", key_listener);
        }
        var trial_data = {
          rt: Math.round(performance.now() - t0),
          url: trial.url
        };
        this.jsPsych.finishTrial(trial_data);
        trial_complete();
      };
      if (trial.execute_script) {
        var all_scripts = display_element.getElementsByTagName("script");
        for (var i = 0; i < all_scripts.length; i++) {
          const relocatedScript = document.createElement("script");
          const curr_script = all_scripts[i];
          relocatedScript.text = curr_script.text;
          curr_script.parentNode.replaceChild(relocatedScript, curr_script);
        }
      }
      if (trial.cont_btn) {
        display_element.querySelector("#" + trial.cont_btn).addEventListener("click", finish);
      }
      if (trial.cont_key) {
        display_element.addEventListener("keydown", key_listener);
      }
    }).catch((err) => {
      console.error(`Something went wrong with fetch() in plugin-external-html.`, err);
    });
    return new Promise((resolve) => {
      trial_complete = resolve;
    });
  }
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      url: trial.url,
      rt: this.jsPsych.randomization.sampleExGaussian(2e3, 200, 1 / 200, true)
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial, () => {
      load_callback();
      if (trial.cont_key) {
        this.jsPsych.pluginAPI.pressKey(trial.cont_key, data.rt);
      } else if (trial.cont_btn) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector("#" + trial.cont_btn),
          data.rt
        );
      }
    });
  }
}

module.exports = ExternalHtmlPlugin;
//# sourceMappingURL=index.cjs.map
