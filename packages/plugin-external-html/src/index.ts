import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "external-html",
  parameters: {
    /** The url of the external html page */
    url: {
      type: ParameterType.STRING,
      pretty_name: "URL",
      default: undefined,
    },
    /** The key to continue to the next page. */
    cont_key: {
      type: ParameterType.KEY,
      pretty_name: "Continue key",
      default: null,
    },
    /** The button to continue to the next page. */
    cont_btn: {
      type: ParameterType.STRING,
      pretty_name: "Continue button",
      default: null,
    },
    /** Function to check whether user is allowed to continue after clicking cont_key or clicking cont_btn */
    check_fn: {
      type: ParameterType.FUNCTION,
      pretty_name: "Check function",
      default: () => true,
    },
    /** Whether or not to force a page refresh. */
    force_refresh: {
      type: ParameterType.BOOL,
      pretty_name: "Force refresh",
      default: false,
    },
    /** If execute_Script == true, then all JavasScript code on the external page will be executed. */
    execute_script: {
      type: ParameterType.BOOL,
      pretty_name: "Execute scripts",
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * **external-html**
 *
 * jsPsych plugin to load and display an external html page. To proceed to the next trial, the
 * user might either press a button on the page or a specific key. Afterwards, the page will be hidden and
 * the experiment will continue.
 *
 * @author Erik Weitnauer
 * @see {@link https://www.jspsych.org/plugins/jspsych-external-html/ external-html plugin documentation on jspsych.org}
 */
class ExternalHtmlPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    // hold the .resolve() function from the Promise that ends the trial
    let trial_complete;

    var url = trial.url;
    if (trial.force_refresh) {
      url = trial.url + "?t=" + performance.now();
    }

    fetch(url)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
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
            url: trial.url,
          };
          display_element.innerHTML = "";
          this.jsPsych.finishTrial(trial_data);
          trial_complete();
        };

        // by default, scripts on the external page are not executed with XMLHttpRequest().
        // To activate their content through DOM manipulation, we need to relocate all script tags
        if (trial.execute_script) {
          // changed for..of getElementsByTagName("script") here to for i loop due to TS error:
          // Type 'HTMLCollectionOf<HTMLScriptElement>' must have a '[Symbol.iterator]()' method that returns an iterator.ts(2488)
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
      })
      .catch((err) => {
        console.error(`Something went wrong with fetch() in plugin-external-html.`, err);
      });

    // helper to load via XMLHttpRequest
    /*const load = (element, file, callback) => {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", file, true);
      xmlhttp.onload = () => {
        console.log(`loaded ${xmlhttp.status}`)
        if (xmlhttp.status == 200 || xmlhttp.status == 0) {
          //Check if loaded
          element.innerHTML = xmlhttp.responseText;
          console.log(`made it ${xmlhttp.responseText}`);
          callback();
        }
      };
      xmlhttp.send();
    };

    load(display_element, url, () => {
      
    });
*/
    return new Promise((resolve) => {
      trial_complete = resolve;
    });
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
    const default_data = {
      url: trial.url,
      rt: this.jsPsych.randomization.sampleExGaussian(2000, 200, 1 / 200, true),
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

export default ExternalHtmlPlugin;
