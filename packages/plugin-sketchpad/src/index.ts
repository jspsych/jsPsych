import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "sketchpad",
  parameters: {
    /**
     * The shape of the canvas element. Accepts `'rectangle'` or `'circle'`
     */
    canvas_shape: {
      type: ParameterType.STRING,
      default: "rectangle",
    },
    /**
     * Width of the canvas in pixels.
     */
    canvas_width: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Width of the canvas in pixels.
     */
    canvas_height: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Diametere of the canvas (when `canvas_shape` is `'circle'`) in pixels.
     */
    canvas_diameter: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Diametere of the canvas (when `canvas_shape` is `'circle'`) in pixels.
     */
    canvas_border_width: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * Diametere of the canvas (when `canvas_shape` is `'circle'`) in pixels.
     */
    canvas_border_color: {
      type: ParameterType.STRING,
      default: "#000",
    },
  },
};

type Info = typeof info;

/**
 * **sketchpad**
 *
 * jsPsych plugin for displaying a canvas stimulus and getting a slider response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/sketchpad/ sketchpad plugin documentation on jspsych.org}
 */
class SketchpadPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    let canvas_html;
    if (trial.canvas_shape == "rectangle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" width="${trial.canvas_width}" height="${trial.canvas_height}" style="border: ${trial.canvas_border_width}px solid ${trial.canvas_border_color};"></canvas>
      `;
    } else if (trial.canvas_shape == "circle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" width="${trial.canvas_diameter}" height="${
        trial.canvas_diameter
      }" style="border: ${trial.canvas_border_width}px solid ${
        trial.canvas_border_color
      }; border-radius:${trial.canvas_diameter / 2}px;"></canvas>
      `;
    } else {
      throw new Error(
        '`canvas_shape` parameter in sketchpad plugin must be either "rectangle" or "circle"'
      );
    }

    const finish_button_html = `<p><button class="jspsych-btn" id="sketchpad-end">Finished</button></p>`;

    const display_html = canvas_html + finish_button_html;

    display_element.innerHTML = display_html;

    display_element.querySelector("#sketchpad-end").addEventListener("click", () => {
      end_trial();
    });

    const end_trial = () => {
      display_element.innerHTML = "";

      this.jsPsych.finishTrial({});
    };
  }
}

export default SketchpadPlugin;
