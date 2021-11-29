import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "maxdiff",
  parameters: {
    /** Array containing the alternatives to be presented in the maxdiff table. */
    alternatives: {
      type: ParameterType.STRING,
      pretty_name: "Alternatives",
      array: true,
      default: undefined,
    },
    /** Array containing the labels to display for left and right response columns. */
    labels: {
      type: ParameterType.STRING,
      array: true,
      pretty_name: "Labels",
      default: undefined,
    },
    /** If true, the order of the alternatives will be randomized. */
    randomize_alternative_order: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize Alternative Order",
      default: false,
    },
    /** String to display at top of the page. */
    preamble: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Preamble",
      default: "",
    },
    /** Label of the button to submit response. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button Label",
      default: "Continue",
    },
    /** Makes answering the alternative required. */
    required: {
      type: ParameterType.BOOL,
      pretty_name: "Required",
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * **maxdiff**
 *
 * jsPsych plugin for maxdiff/conjoint analysis designs
 *
 * @author Angus Hughes
 * @see {@link https://www.jspsych.org/plugins/jspsych-maxdiff/ maxdiff plugin documentation on jspsych.org}
 */
class MaxdiffPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var html = "";
    // inject CSS for trial
    html += '<style id="jspsych-maxdiff-css">';
    html +=
      ".jspsych-maxdiff-statement {display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px;}" +
      "table.jspsych-maxdiff-table {border-collapse: collapse; padding: 15px; margin-left: auto; margin-right: auto;}" +
      "table.jspsych-maxdiff-table td, th {border-bottom: 1px solid #dddddd; text-align: center; padding: 8px;}" +
      "table.jspsych-maxdiff-table tr:nth-child(even) {background-color: #dddddd;}";
    html += "</style>";

    // show preamble text
    if (trial.preamble !== null) {
      html +=
        '<div id="jspsych-maxdiff-preamble" class="jspsych-maxdiff-preamble">' +
        trial.preamble +
        "</div>";
    }
    html += '<form id="jspsych-maxdiff-form">';

    // add maxdiff options ///
    // first generate alternative order, randomized here as opposed to randomizing the order of alternatives
    // so that the data are always associated with the same alternative regardless of order.
    var alternative_order = [];
    for (var i = 0; i < trial.alternatives.length; i++) {
      alternative_order.push(i);
    }
    if (trial.randomize_alternative_order) {
      alternative_order = this.jsPsych.randomization.shuffle(alternative_order);
    }

    // Start with column headings
    var maxdiff_table =
      '<table class="jspsych-maxdiff-table"><tr><th id="jspsych-maxdiff-left-label">' +
      trial.labels[0] +
      '</th><th></th><th id="jspsych-maxdiff-right-label">' +
      trial.labels[1] +
      "</th></tr>";

    // construct each row of the maxdiff table
    for (var i = 0; i < trial.alternatives.length; i++) {
      var alternative = trial.alternatives[alternative_order[i]];
      // add alternative
      maxdiff_table +=
        '<tr><td><input class= "jspsych-maxdiff-alt-' +
        i.toString() +
        '" type="radio" name="left" data-name = ' +
        alternative_order[i].toString() +
        " /><br></td>";
      maxdiff_table +=
        '<td id="jspsych-maxdiff-alternative-' + i.toString() + '">' + alternative + "</td>";
      maxdiff_table +=
        '<td><input class= "jspsych-maxdiff-alt-' +
        i.toString() +
        '" type="radio" name="right" data-name = ' +
        alternative_order[i].toString() +
        " /><br></td></tr>";
    }
    maxdiff_table += "</table><br><br>";
    html += maxdiff_table;

    // add submit button
    var enable_submit = trial.required == true ? 'disabled = "disabled"' : "";
    html +=
      '<input type="submit" id="jspsych-maxdiff-next" class="jspsych-maxdiff jspsych-btn" ' +
      enable_submit +
      ' value="' +
      trial.button_label +
      '"></input>';
    html += "</form>";

    display_element.innerHTML = html;

    // function to control responses
    // first checks that the same alternative cannot be endorsed in the left and right columns simultaneously.
    // then enables the submit button if the trial is required.
    const left_right = ["left", "right"];
    left_right.forEach((p) => {
      // Get all elements either 'left' or 'right'
      document.getElementsByName(p).forEach((alt) => {
        alt.addEventListener("click", () => {
          // Find the opposite (if left, then right & vice versa) identified by the class (jspsych-maxdiff-alt-1, 2, etc)
          var op = alt["name"] == "left" ? "right" : "left";
          var n = document.getElementsByClassName(alt.className).namedItem(op);
          // If it's checked, uncheck it.
          if (n["checked"]) {
            n["checked"] = false;
          }

          // check response
          if (trial.required) {
            // Now check if one of both left and right have been enabled to allow submission
            var left_checked = Array.from(document.getElementsByName("left")).some(
              (c: HTMLInputElement) => c.checked
            );
            var right_checked = Array.from(document.getElementsByName("right")).some(
              (c: HTMLInputElement) => c.checked
            );
            if (left_checked && right_checked) {
              (document.getElementById("jspsych-maxdiff-next") as HTMLInputElement).disabled =
                false;
            } else {
              (document.getElementById("jspsych-maxdiff-next") as HTMLInputElement).disabled = true;
            }
          }
        });
      });
    });

    // Get the data once the submit button is clicked
    // Get the data once the submit button is clicked
    display_element.querySelector("#jspsych-maxdiff-form").addEventListener("submit", (e) => {
      e.preventDefault();

      // measure response time
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);

      // get the alternative by the data-name attribute, allowing a null response if unchecked
      function get_response(side) {
        var col = display_element.querySelectorAll('[name="' + side + '"]:checked')[0];
        if (col === undefined) {
          return null;
        } else {
          var i = parseInt(col.getAttribute("data-name"));
          return trial.alternatives[i];
        }
      }

      // data saving
      var trial_data = {
        rt: response_time,
        labels: { left: trial.labels[0], right: trial.labels[1] },
        response: { left: get_response("left"), right: get_response("right") },
      };

      // clear the display
      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
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
      rt: this.jsPsych.randomization.sampleExGaussian(3000, 300, 1 / 300, true),
      labels: trial.labels,
      response: response,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    //@ts-ignore something about symbol iterators?
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
        (data.rt / 3) * 2
      );
    }

    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-maxdiff-next"),
      data.rt
    );
  }
}

export default MaxdiffPlugin;
