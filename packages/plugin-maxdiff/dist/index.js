import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "maxdiff",
  version,
  parameters: {
    /** An array of one or more alternatives of string type to fill the rows of the maxdiff table. If `required` is true,
     * then the array must contain two or more alternatives, so that at least one can be selected for both the left
     * and right columns.  */
    alternatives: {
      type: ParameterType.STRING,
      array: true,
      default: void 0
    },
    /** An array with exactly two labels of string type to display as column headings (to the left and right of the
     * alternatives) for responses on the criteria of interest. */
    labels: {
      type: ParameterType.STRING,
      array: true,
      default: void 0
    },
    /** If true, the display order of `alternatives` is randomly determined at the start of the trial. */
    randomize_alternative_order: {
      type: ParameterType.BOOL,
      default: false
    },
    /** HTML formatted string to display at the top of the page above the maxdiff table. */
    preamble: {
      type: ParameterType.HTML_STRING,
      default: ""
    },
    /** Label of the button to submit response. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    },
    /** If true, prevents the user from submitting the response and proceeding until a radio button in both the left and right response columns has been selected. */
    required: {
      type: ParameterType.BOOL,
      default: false
    }
  },
  data: {
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the maxdiff table first
     * appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT
    },
    /** An object with two keys, `left` and `right`, containing the labels (strings) corresponding to the left and right response
     * columns. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
    labels: {
      type: ParameterType.COMPLEX,
      nested: {
        left: {
          type: ParameterType.STRING
        },
        right: {
          type: ParameterType.STRING
        }
      }
    },
    /** An object with two keys, `left` and `right`, containing the alternatives selected on the left and right columns.
     * This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: ParameterType.COMPLEX,
      nested: {
        left: {
          type: ParameterType.STRING
        },
        right: {
          type: ParameterType.STRING
        }
      }
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class MaxdiffPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var html = "";
    html += '<style id="jspsych-maxdiff-css">';
    html += ".jspsych-maxdiff-statement {display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px;}table.jspsych-maxdiff-table {border-collapse: collapse; padding: 15px; margin-left: auto; margin-right: auto;}table.jspsych-maxdiff-table td, th {border-bottom: 1px solid #dddddd; text-align: center; padding: 8px;}table.jspsych-maxdiff-table tr:nth-child(even) {background-color: #dddddd;}";
    html += "</style>";
    if (trial.preamble !== null) {
      html += '<div id="jspsych-maxdiff-preamble" class="jspsych-maxdiff-preamble">' + trial.preamble + "</div>";
    }
    html += '<form id="jspsych-maxdiff-form">';
    var alternative_order = [];
    for (var i = 0; i < trial.alternatives.length; i++) {
      alternative_order.push(i);
    }
    if (trial.randomize_alternative_order) {
      alternative_order = this.jsPsych.randomization.shuffle(alternative_order);
    }
    var maxdiff_table = '<table class="jspsych-maxdiff-table"><tr><th id="jspsych-maxdiff-left-label">' + trial.labels[0] + '</th><th></th><th id="jspsych-maxdiff-right-label">' + trial.labels[1] + "</th></tr>";
    for (var i = 0; i < trial.alternatives.length; i++) {
      var alternative = trial.alternatives[alternative_order[i]];
      maxdiff_table += '<tr><td><input class= "jspsych-maxdiff-alt-' + i.toString() + '" type="radio" name="left" data-name = ' + alternative_order[i].toString() + " /><br></td>";
      maxdiff_table += '<td id="jspsych-maxdiff-alternative-' + i.toString() + '">' + alternative + "</td>";
      maxdiff_table += '<td><input class= "jspsych-maxdiff-alt-' + i.toString() + '" type="radio" name="right" data-name = ' + alternative_order[i].toString() + " /><br></td></tr>";
    }
    maxdiff_table += "</table><br><br>";
    html += maxdiff_table;
    var enable_submit = trial.required == true ? 'disabled = "disabled"' : "";
    html += '<input type="submit" id="jspsych-maxdiff-next" class="jspsych-maxdiff jspsych-btn" ' + enable_submit + ' value="' + trial.button_label + '"></input>';
    html += "</form>";
    display_element.innerHTML = html;
    const left_right = ["left", "right"];
    left_right.forEach((p) => {
      document.getElementsByName(p).forEach((alt) => {
        alt.addEventListener("click", () => {
          var op = alt["name"] == "left" ? "right" : "left";
          var n = document.getElementsByClassName(alt.className).namedItem(op);
          if (n["checked"]) {
            n["checked"] = false;
          }
          if (trial.required) {
            var left_checked = Array.prototype.slice.call(document.getElementsByName("left")).some((c) => c.checked);
            var right_checked = Array.prototype.slice.call(document.getElementsByName("right")).some((c) => c.checked);
            if (left_checked && right_checked) {
              document.getElementById("jspsych-maxdiff-next").disabled = false;
            } else {
              document.getElementById("jspsych-maxdiff-next").disabled = true;
            }
          }
        });
      });
    });
    display_element.querySelector("#jspsych-maxdiff-form").addEventListener("submit", (e) => {
      e.preventDefault();
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      function get_response(side) {
        var col = display_element.querySelectorAll('[name="' + side + '"]:checked')[0];
        if (col === void 0) {
          return null;
        } else {
          var i2 = parseInt(col.getAttribute("data-name"));
          return trial.alternatives[i2];
        }
      }
      var trial_data = {
        rt: response_time,
        labels: { left: trial.labels[0], right: trial.labels[1] },
        response: { left: get_response("left"), right: get_response("right") }
      };
      this.jsPsych.finishTrial(trial_data);
    });
    var startTime = performance.now();
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
    const choices = this.jsPsych.randomization.sampleWithoutReplacement(trial.alternatives, 2);
    const response = { left: null, right: null };
    if (!trial.required && this.jsPsych.randomization.sampleBernoulli(0.1)) {
      choices.pop();
      if (this.jsPsych.randomization.sampleBernoulli(0.8)) {
        choices.pop();
      }
    }
    if (choices.length == 1) {
      if (this.jsPsych.randomization.sampleBernoulli(0.5)) {
        response.left = choices[0];
      } else {
        response.right = choices[0];
      }
    }
    if (choices.length == 2) {
      response.left = choices[0];
      response.right = choices[1];
    }
    const default_data = {
      rt: this.jsPsych.randomization.sampleExGaussian(3e3, 300, 1 / 300, true),
      labels: trial.labels,
      response
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
    this.trial(display_element, trial);
    load_callback();
    const list = [...display_element.querySelectorAll("[id^=jspsych-maxdiff-alternative]")].map(
      (x) => {
        return x.innerHTML;
      }
    );
    if (data.response.left !== null) {
      const index_left = list.indexOf(data.response.left);
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(`.jspsych-maxdiff-alt-${index_left}[name="left"]`),
        data.rt / 3
      );
    }
    if (data.response.right !== null) {
      const index_right = list.indexOf(data.response.right);
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(`.jspsych-maxdiff-alt-${index_right}[name="right"]`),
        data.rt / 3 * 2
      );
    }
    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-maxdiff-next"),
      data.rt
    );
  }
}

export { MaxdiffPlugin as default };
//# sourceMappingURL=index.js.map
