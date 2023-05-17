import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "instructions",
  parameters: {
    /** Each element of the array is the HTML-formatted content for a single page. */
    pages: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Pages",
      default: undefined,
      array: true,
    },
    /** The key the subject can press in order to advance to the next page. */
    key_forward: {
      type: ParameterType.KEY,
      pretty_name: "Key forward",
      default: "ArrowRight",
    },
    /** The key that the subject can press to return to the previous page. */
    key_backward: {
      type: ParameterType.KEY,
      pretty_name: "Key backward",
      default: "ArrowLeft",
    },
    /** If true, the subject can return to the previous page of the instructions. */
    allow_backward: {
      type: ParameterType.BOOL,
      pretty_name: "Allow backward",
      default: true,
    },
    /** If true, the subject can use keyboard keys to navigate the pages. */
    allow_keys: {
      type: ParameterType.BOOL,
      pretty_name: "Allow keys",
      default: true,
    },
    /** If true, then a "Previous" and "Next" button will be displayed beneath the instructions. */
    show_clickable_nav: {
      type: ParameterType.BOOL,
      pretty_name: "Show clickable nav",
      default: false,
    },
    /** If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. */
    show_page_number: {
      type: ParameterType.BOOL,
      pretty_name: "Show page number",
      default: false,
    },
    /** The text that appears before x/y (current/total) pages displayed with show_page_number. */
    page_label: {
      type: ParameterType.STRING,
      pretty_name: "Page label",
      default: "Page",
    },
    /** The text that appears on the button to go backwards. */
    button_label_previous: {
      type: ParameterType.STRING,
      pretty_name: "Button label previous",
      default: "Previous",
    },
    /** The text that appears on the button to go forwards. */
    button_label_next: {
      type: ParameterType.STRING,
      pretty_name: "Button label next",
      default: "Next",
    },
  },
};

type Info = typeof info;

/**
 * **instructions**
 *
 * jsPsych plugin to display text (including HTML-formatted strings) during the experiment.
 * Use it to show a set of pages that participants can move forward/backward through.
 * Page numbers can be displayed to help with navigation by setting show_page_number to true.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-instructions/ instructions plugin documentation on jspsych.org}
 */
class InstructionsPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var current_page = 0;

    var view_history = [];

    var start_time = performance.now();

    var last_page_update_time = start_time;

    function btnListener(evt) {
      evt.target.removeEventListener("click", btnListener);
      if (this.id === "jspsych-instructions-back") {
        back();
      } else if (this.id === "jspsych-instructions-next") {
        next();
      }
    }

    function show_current_page() {
      var html = trial.pages[current_page];

      var pagenum_display = "";
      if (trial.show_page_number) {
        pagenum_display =
          "<span style='margin: 0 1em;' class='" +
          "jspsych-instructions-pagenum'>" +
          trial.page_label +
          " " +
          (current_page + 1) +
          "/" +
          trial.pages.length +
          "</span>";
      }

      if (trial.show_clickable_nav) {
        var nav_html = "<div class='jspsych-instructions-nav' style='padding: 10px 0px;'>";
        if (trial.allow_backward) {
          var allowed = current_page > 0 ? "" : "disabled='disabled'";
          nav_html +=
            "<button id='jspsych-instructions-back' class='jspsych-btn' style='margin-right: 5px;' " +
            allowed +
            ">&lt; " +
            trial.button_label_previous +
            "</button>";
        }
        if (trial.pages.length > 1 && trial.show_page_number) {
          nav_html += pagenum_display;
        }
        nav_html +=
          "<button id='jspsych-instructions-next' class='jspsych-btn'" +
          "style='margin-left: 5px;'>" +
          trial.button_label_next +
          " &gt;</button></div>";

        html += nav_html;
        display_element.innerHTML = html;
        if (current_page != 0 && trial.allow_backward) {
          display_element
            .querySelector("#jspsych-instructions-back")
            .addEventListener("click", btnListener);
        }

        display_element
          .querySelector("#jspsych-instructions-next")
          .addEventListener("click", btnListener);
      } else {
        if (trial.show_page_number && trial.pages.length > 1) {
          // page numbers for non-mouse navigation
          html += "<div class='jspsych-instructions-pagenum'>" + pagenum_display + "</div>";
        }
        display_element.innerHTML = html;
      }
    }

    function next() {
      add_current_page_to_view_history();

      current_page++;

      // if done, finish up...
      if (current_page >= trial.pages.length) {
        endTrial();
      } else {
        show_current_page();
      }
    }

    function back() {
      add_current_page_to_view_history();

      current_page--;

      show_current_page();
    }

    function add_current_page_to_view_history() {
      var current_time = performance.now();

      var page_view_time = Math.round(current_time - last_page_update_time);

      view_history.push({
        page_index: current_page,
        viewing_time: page_view_time,
      });

      last_page_update_time = current_time;
    }

    const endTrial = () => {
      if (trial.allow_keys) {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
      }

      display_element.innerHTML = "";

      var trial_data = {
        view_history: view_history,
        rt: Math.round(performance.now() - start_time),
      };

      this.jsPsych.finishTrial(trial_data);
    };

    const after_response = (info) => {
      // have to reinitialize this instead of letting it persist to prevent accidental skips of pages by holding down keys too long
      keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
      // check if key is forwards or backwards and update page
      if (this.jsPsych.pluginAPI.compareKeys(info.key, trial.key_backward)) {
        if (current_page !== 0 && trial.allow_backward) {
          back();
        }
      }

      if (this.jsPsych.pluginAPI.compareKeys(info.key, trial.key_forward)) {
        next();
      }
    };

    show_current_page();

    if (trial.allow_keys) {
      var keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: "performance",
        persist: false,
      });
    }
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
    let curr_page = 0;
    let rt = 0;
    let view_history = [];

    // if there is no view history and no RT, simulate a random walk through the pages
    if (!simulation_options.data?.view_history && !simulation_options.data?.rt) {
      while (curr_page !== trial.pages.length) {
        const view_time = Math.round(
          this.jsPsych.randomization.sampleExGaussian(3000, 300, 1 / 300)
        );
        view_history.push({ page_index: curr_page, viewing_time: view_time });
        rt += view_time;
        if (curr_page == 0 || !trial.allow_backward) {
          curr_page++;
        } else {
          if (this.jsPsych.randomization.sampleBernoulli(0.9) == 1) {
            curr_page++;
          } else {
            curr_page--;
          }
        }
      }
    }

    // if there is an RT but no view history, simulate a random walk through the pages
    // that ends on the final page when the RT is reached
    if (!simulation_options.data?.view_history && simulation_options.data?.rt) {
      rt = simulation_options.data.rt;
      while (curr_page !== trial.pages.length) {
        view_history.push({ page_index: curr_page, viewing_time: null });
        if (curr_page == 0 || !trial.allow_backward) {
          curr_page++;
        } else {
          if (this.jsPsych.randomization.sampleBernoulli(0.9) == 1) {
            curr_page++;
          } else {
            curr_page--;
          }
        }
      }
      const avg_rt_per_page = simulation_options.data.rt / view_history.length;
      let total_time = 0;
      for (const page of view_history) {
        const t = Math.round(
          this.jsPsych.randomization.sampleExGaussian(
            avg_rt_per_page,
            avg_rt_per_page / 10,
            1 / (avg_rt_per_page / 10)
          )
        );
        page.viewing_time = t;
        total_time += t;
      }
      const diff = simulation_options.data.rt - total_time;
      // remove equal diff from each page
      const diff_per_page = Math.round(diff / view_history.length);
      for (const page of view_history) {
        page.viewing_time += diff_per_page;
      }
    }

    // if there is a view history but no RT, make the RT equal the sum of the view history
    if (simulation_options.data?.view_history && !simulation_options.data?.rt) {
      view_history = simulation_options.data.view_history;
      rt = 0;
      for (const page of simulation_options.data.view_history) {
        rt += page.viewing_time;
      }
    }

    const default_data = {
      view_history: view_history,
      rt: rt,
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

    const advance = (rt) => {
      if (trial.allow_keys) {
        this.jsPsych.pluginAPI.pressKey(trial.key_forward, rt);
      } else if (trial.show_clickable_nav) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector("#jspsych-instructions-next"),
          rt
        );
      }
    };

    const backup = (rt) => {
      if (trial.allow_keys) {
        this.jsPsych.pluginAPI.pressKey(trial.key_backward, rt);
      } else if (trial.show_clickable_nav) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector("#jspsych-instructions-back"),
          rt
        );
      }
    };

    let curr_page = 0;
    let t = 0;
    for (let i = 0; i < data.view_history.length; i++) {
      if (i == data.view_history.length - 1) {
        advance(t + data.view_history[i].viewing_time);
      } else {
        if (data.view_history[i + 1].page_index > curr_page) {
          advance(t + data.view_history[i].viewing_time);
        }
        if (data.view_history[i + 1].page_index < curr_page) {
          backup(t + data.view_history[i].viewing_time);
        }
        t += data.view_history[i].viewing_time;
        curr_page = data.view_history[i + 1].page_index;
      }
    }
  }
}

export default InstructionsPlugin;
