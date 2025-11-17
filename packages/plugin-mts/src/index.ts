import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";

const info = <const>{
  name: "mts",
  version: "1.0.0",
  parameters: {
    /**
     * Array of sample stimuli to display. Can be image paths or HTML strings.
     * Multiple samples can be displayed simultaneously (e.g., for contextual stimuli).
     */
    sample_stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /**
     * Audio file to play as sample stimulus. If provided, participant must click
     * sample to play audio before comparisons appear (for SMTS) or audio plays automatically.
     */
    sample_audio: {
      type: ParameterType.AUDIO,
      default: null,
    },
    /**
     * Array of comparison stimuli to display. Can be image paths or HTML strings.
     */
    comparison_stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /**
     * The correct comparison stimulus (or array of correct stimuli for multiple correct responses).
     */
    correct_comparison: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },
    /**
     * Positions for sample stimuli in pixels [x, y] relative to center.
     * If only one position provided, it applies to the first sample.
     */
    sample_positions: {
      type: ParameterType.INT,
      default: [[0, 200]],
      array: true,
      nested: {
        x: { type: ParameterType.INT },
        y: { type: ParameterType.INT },
      },
    },
    /**
     * Positions for comparison stimuli in pixels [x, y] relative to center.
     */
    comparison_positions: {
      type: ParameterType.INT,
      default: [
        [-350, -200],
        [350, -200],
      ],
      array: true,
      nested: {
        x: { type: ParameterType.INT },
        y: { type: ParameterType.INT },
      },
    },
    /**
     * Size of stimuli in pixels [width, height].
     */
    stimulus_size: {
      type: ParameterType.INT,
      default: [200, 200],
      array: true,
    },
    /**
     * Protocol type: 'SMTS' (simultaneous), 'DMTS' (delay in seconds), or number for delay duration.
     */
    protocol: {
      type: ParameterType.STRING,
      default: "SMTS",
    },
    /**
     * Delay in milliseconds before comparison stimuli appear (if protocol is DMTS or number).
     */
    comparison_delay: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * Image to display as consequence for correct response.
     */
    correct_consequence_image: {
      type: ParameterType.IMAGE,
      default: null,
    },
    /**
     * Audio to play as consequence for correct response.
     */
    correct_consequence_audio: {
      type: ParameterType.AUDIO,
      default: null,
    },
    /**
     * Duration in milliseconds to display correct consequence.
     */
    correct_consequence_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /**
     * Image to display as consequence for incorrect response.
     */
    incorrect_consequence_image: {
      type: ParameterType.IMAGE,
      default: null,
    },
    /**
     * Audio to play as consequence for incorrect response.
     */
    incorrect_consequence_audio: {
      type: ParameterType.AUDIO,
      default: null,
    },
    /**
     * Duration in milliseconds to display incorrect consequence.
     */
    incorrect_consequence_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /**
     * Inter-trial interval in milliseconds after consequence.
     */
    iti_duration: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * Background color of the display element.
     */
    background_color: {
      type: ParameterType.STRING,
      default: "#000000",
    },
    /**
     * Size of consequence images in pixels [width, height].
     */
    consequence_size: {
      type: ParameterType.INT,
      default: [600, 400],
      array: true,
    },
    /**
     * Whether to randomize the positions of comparison stimuli.
     */
    randomize_comparison_positions: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Whether the sample must be clicked before comparisons appear (SMTS with audio).
     */
    require_sample_click: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Volume for audio playback (0.0 to 1.0).
     */
    audio_volume: {
      type: ParameterType.FLOAT,
      default: 0.5,
    },
    /**
     * Whether to allow clicking on sample during comparison phase to replay audio.
     */
    allow_sample_audio_replay: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /**
     * The sample stimuli that were displayed.
     */
    sample_stimuli: {
      type: ParameterType.STRING,
      array: true,
    },
    /**
     * The sample audio that was played (if any).
     */
    sample_audio: {
      type: ParameterType.STRING,
    },
    /**
     * The comparison stimuli that were displayed.
     */
    comparison_stimuli: {
      type: ParameterType.STRING,
      array: true,
    },
    /**
     * The correct comparison stimulus.
     */
    correct_comparison: {
      type: ParameterType.STRING,
      array: true,
    },
    /**
     * The comparison stimulus that was selected.
     */
    selected_comparison: {
      type: ParameterType.STRING,
    },
    /**
     * Index of the selected comparison in the comparison_stimuli array.
     */
    selected_comparison_index: {
      type: ParameterType.INT,
    },
    /**
     * Whether the response was correct.
     */
    correct: {
      type: ParameterType.BOOL,
    },
    /**
     * Reaction time from sample click to comparison selection in milliseconds.
     */
    rt_comparison: {
      type: ParameterType.INT,
    },
    /**
     * Time from trial start to sample click in milliseconds.
     */
    rt_sample: {
      type: ParameterType.INT,
    },
    /**
     * Total trial duration in milliseconds.
     */
    rt_total: {
      type: ParameterType.INT,
    },
    /**
     * Number of times the sample audio was played.
     */
    sample_audio_plays: {
      type: ParameterType.INT,
    },
    /**
     * Protocol used for this trial.
     */
    protocol: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin implements Match-to-Sample (MTS) procedures for equivalence class formation
 * and behavioral research. It supports simultaneous (SMTS) and delayed (DMTS) matching,
 * visual and auditory stimuli, customizable feedback, and comprehensive data collection.
 *
 * Based on PyMTS - A Python Match-to-Sample program by Carvalho, F. C., Regaço, A., & de Rose, J. C. (2023)
 *
 * @author Your Name
 * @see {@link https://www.jspsych.org/latest/plugins/mts/ mts plugin documentation on jspsych.org}
 */
class MtsPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Set background color
    display_element.style.backgroundColor = trial.background_color;
    display_element.style.position = "relative";
    display_element.style.width = "100%";
    display_element.style.height = "100vh";

    // Trial timing variables
    const trial_start_time = performance.now();
    let sample_click_time: number | null = null;
    let comparison_click_time: number | null = null;
    let sample_audio_plays = 0;
    let selected_comparison: string | null = null;
    let selected_comparison_index: number | null = null;
    let is_correct: boolean | null = null;

    // Preload audio if needed
    let sample_audio_player: AudioPlayerInterface | null = null;
    if (trial.sample_audio) {
      try {
        sample_audio_player = await this.jsPsych.pluginAPI.getAudioPlayer(trial.sample_audio);
      } catch (error) {
        console.error("Error loading sample audio:", error);
      }
    }

    // Shuffle comparison positions if requested
    let comparison_order = trial.comparison_stimuli.map((_, i) => i);
    if (trial.randomize_comparison_positions) {
      comparison_order = this.jsPsych.randomization.shuffle(comparison_order);
    }

    // Phase 1: Display sample stimuli
    await this.displaySample(
      display_element,
      trial,
      sample_audio_player,
      (time, plays) => {
        sample_click_time = time;
        sample_audio_plays = plays;
      }
    );

    // Phase 2: Display comparison stimuli (with optional delay)
    if (trial.protocol !== "SMTS" && trial.comparison_delay > 0) {
      // Clear sample for DMTS
      display_element.innerHTML = "";
      await this.jsPsych.pluginAPI.setTimeout(async () => {
        await this.displayComparison(
          display_element,
          trial,
          comparison_order,
          sample_audio_player,
          sample_audio_plays,
          (comp, idx, time) => {
            selected_comparison = comp;
            selected_comparison_index = idx;
            comparison_click_time = time;
          }
        );
      }, trial.comparison_delay);
    } else {
      // SMTS - comparisons appear immediately or after sample click
      await this.displayComparison(
        display_element,
        trial,
        comparison_order,
        sample_audio_player,
        sample_audio_plays,
        (comp, idx, time) => {
          selected_comparison = comp;
          selected_comparison_index = idx;
          comparison_click_time = time;
        }
      );
    }

    // Wait for comparison selection
    await new Promise<void>((resolve) => {
      const checkSelection = () => {
        if (selected_comparison !== null) {
          resolve();
        } else {
          requestAnimationFrame(checkSelection);
        }
      };
      checkSelection();
    });

    // Check if response is correct
    const correct_comparisons = Array.isArray(trial.correct_comparison)
      ? trial.correct_comparison
      : [trial.correct_comparison];
    is_correct = correct_comparisons.includes(selected_comparison!);

    // Phase 3: Display consequence
    const consequence_duration = is_correct
      ? trial.correct_consequence_duration
      : trial.incorrect_consequence_duration;
    const consequence_image = is_correct
      ? trial.correct_consequence_image
      : trial.incorrect_consequence_image;
    const consequence_audio = is_correct
      ? trial.correct_consequence_audio
      : trial.incorrect_consequence_audio;

    if (consequence_image || consequence_audio) {
      display_element.innerHTML = "";
      await this.displayConsequence(
        display_element,
        trial,
        consequence_image,
        consequence_audio,
        consequence_duration
      );
    }

    // Phase 4: ITI
    if (trial.iti_duration > 0) {
      display_element.innerHTML = "";
      await this.jsPsych.pluginAPI.setTimeout(() => {}, trial.iti_duration);
    }

    // Calculate reaction times
    const rt_sample = sample_click_time !== null ? sample_click_time - trial_start_time : null;
    const rt_comparison =
      comparison_click_time !== null && sample_click_time !== null
        ? comparison_click_time - sample_click_time
        : null;
    const rt_total = performance.now() - trial_start_time;

    // Gather trial data
    const trial_data = {
      sample_stimuli: trial.sample_stimuli,
      sample_audio: trial.sample_audio,
      comparison_stimuli: trial.comparison_stimuli,
      correct_comparison: trial.correct_comparison,
      selected_comparison: selected_comparison,
      selected_comparison_index: selected_comparison_index,
      correct: is_correct,
      rt_sample: rt_sample !== null ? Math.round(rt_sample) : null,
      rt_comparison: rt_comparison !== null ? Math.round(rt_comparison) : null,
      rt_total: Math.round(rt_total),
      sample_audio_plays: sample_audio_plays,
      protocol: trial.protocol,
    };

    // Clear display
    display_element.innerHTML = "";
    display_element.style.backgroundColor = "";

    // End trial
    this.jsPsych.finishTrial(trial_data);
  }

  private async displaySample(
    display_element: HTMLElement,
    trial: TrialType<Info>,
    audio_player: AudioPlayerInterface | null,
    onSampleClick: (time: number, plays: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      display_element.innerHTML = "";
      let audio_plays = 0;
      let has_clicked_sample = false;

      // Create sample stimuli
      trial.sample_stimuli.forEach((stimulus, idx) => {
        const pos = trial.sample_positions[idx] || trial.sample_positions[0];
        const img = document.createElement("img");
        img.src = stimulus;
        img.style.position = "absolute";
        img.style.width = `${trial.stimulus_size[0]}px`;
        img.style.height = `${trial.stimulus_size[1]}px`;
        img.style.left = `calc(50% + ${pos[0]}px - ${trial.stimulus_size[0] / 2}px)`;
        img.style.top = `calc(50% - ${pos[1]}px - ${trial.stimulus_size[1] / 2}px)`;
        img.style.cursor = idx === 0 && trial.require_sample_click ? "pointer" : "default";

        // Only first sample is clickable
        if (idx === 0 && trial.require_sample_click) {
          img.addEventListener("click", () => {
            const click_time = performance.now();

            if (!has_clicked_sample) {
              has_clicked_sample = true;
              onSampleClick(click_time, audio_plays);

              // Play audio if present
              if (audio_player) {
                audio_player.play();
                audio_plays++;
              }

              // Resolve to show comparisons (if SMTS)
              if (trial.protocol === "SMTS") {
                resolve();
              }
            }
          });
        }

        display_element.appendChild(img);
      });

      // If no sample click required or no audio, proceed immediately
      if (!trial.require_sample_click || !trial.sample_audio) {
        onSampleClick(performance.now(), 0);
        resolve();
      }
    });
  }

  private async displayComparison(
    display_element: HTMLElement,
    trial: TrialType<Info>,
    comparison_order: number[],
    audio_player: AudioPlayerInterface | null,
    initial_audio_plays: number,
    onComparisonClick: (comp: string, idx: number, time: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      let audio_plays = initial_audio_plays;

      // Keep sample visible for SMTS
      if (trial.protocol === "SMTS") {
        // Sample is already displayed, just add comparisons
      } else {
        // For DMTS, clear and redisplay or just show comparisons
        display_element.innerHTML = "";
      }

      // Create comparison stimuli
      comparison_order.forEach((original_idx, position_idx) => {
        const stimulus = trial.comparison_stimuli[original_idx];
        const pos = trial.comparison_positions[position_idx];
        const img = document.createElement("img");
        img.src = stimulus;
        img.style.position = "absolute";
        img.style.width = `${trial.stimulus_size[0]}px`;
        img.style.height = `${trial.stimulus_size[1]}px`;
        img.style.left = `calc(50% + ${pos[0]}px - ${trial.stimulus_size[0] / 2}px)`;
        img.style.top = `calc(50% - ${pos[1]}px - ${trial.stimulus_size[1] / 2}px)`;
        img.style.cursor = "pointer";

        img.addEventListener("click", () => {
          const click_time = performance.now();
          onComparisonClick(stimulus, original_idx, click_time);
          resolve();
        });

        display_element.appendChild(img);
      });

      // If SMTS with audio replay allowed, keep sample clickable
      if (
        trial.protocol === "SMTS" &&
        trial.allow_sample_audio_replay &&
        audio_player &&
        trial.sample_stimuli.length > 0
      ) {
        const sample_images = display_element.querySelectorAll("img");
        if (sample_images.length > 0) {
          const first_sample = sample_images[0];
          const new_sample = first_sample.cloneNode(true) as HTMLImageElement;
          new_sample.style.cursor = "pointer";
          new_sample.addEventListener("click", () => {
            audio_player.play();
            audio_plays++;
          });
          first_sample.replaceWith(new_sample);
        }
      }
    });
  }

  private async displayConsequence(
    display_element: HTMLElement,
    trial: TrialType<Info>,
    image: string | null,
    audio: string | null,
    duration: number
  ): Promise<void> {
    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.style.position = "absolute";
      img.style.width = `${trial.consequence_size[0]}px`;
      img.style.height = `${trial.consequence_size[1]}px`;
      img.style.left = `calc(50% - ${trial.consequence_size[0] / 2}px)`;
      img.style.top = `calc(50% - ${trial.consequence_size[1] / 2}px)`;
      display_element.appendChild(img);
    }

    if (audio) {
      try {
        const audio_player = await this.jsPsych.pluginAPI.getAudioPlayer(audio);
        audio_player.play();
      } catch (error) {
        console.error("Error loading consequence audio:", error);
      }
    }

    await this.jsPsych.pluginAPI.setTimeout(() => {}, duration);
  }

  async simulate(
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

  private create_simulation_data(trial: TrialType<Info>, data) {
    const correct_comparisons = Array.isArray(trial.correct_comparison)
      ? trial.correct_comparison
      : [trial.correct_comparison];

    const default_data = {
      sample_stimuli: trial.sample_stimuli,
      sample_audio: trial.sample_audio,
      comparison_stimuli: trial.comparison_stimuli,
      correct_comparison: trial.correct_comparison,
      selected_comparison: this.jsPsych.randomization.sampleWithoutReplacement(
        trial.comparison_stimuli,
        1
      )[0],
      selected_comparison_index: 0,
      correct: false,
      rt_sample: this.jsPsych.randomization.sampleExGaussian(500, 100, 1 / 200, true),
      rt_comparison: this.jsPsych.randomization.sampleExGaussian(1000, 200, 1 / 200, true),
      rt_total: 2000,
      sample_audio_plays: trial.sample_audio ? 1 : 0,
      protocol: trial.protocol,
    };

    const selected_idx = trial.comparison_stimuli.indexOf(default_data.selected_comparison);
    default_data.selected_comparison_index = selected_idx;
    default_data.correct = correct_comparisons.includes(default_data.selected_comparison);
    default_data.rt_total =
      default_data.rt_sample + default_data.rt_comparison + (trial.iti_duration || 0);

    const trial_data = Object.assign({}, default_data, data);
    this.jsPsych.finishTrial(trial_data);
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, {});
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, {});
  }
}

export default MtsPlugin;
